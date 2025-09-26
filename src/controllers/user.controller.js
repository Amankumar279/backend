import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
 import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";



const generateAccessAndRefreshTokens=async(userId) =>
  {
  try {
    const user=await User.findById(userId)
    const accessToken=user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken=refreshToken
   await user.save({validateBeforeSave:false})

    return {accessToken,refreshToken}

  } catch (error) {
     throw new ApiError(500,"something went wrong while generating refresh and access tokens")
  }
}


const registerUser = asyncHandler(async (req, res) => {
   //get user details from frontend
   //validation - not empty
   //check user already axist:username,email
   //check for images,check for avatar
   // upload them to cloudinary ,avatar
   // create user object - create entry in db
   //remove password and refresh token field from response
   //check for creation
   // return res
 const{fullName,email,username,password}=req.body


// here some function takes argument and check after trim wheather it is empty 
 if(
    [fullName,email,username,password].some((filed)=>
    filed?.trim()==="")
 ){
    throw new ApiError(400,"All fields are required")
 }

 // here or operator check both the value 
   const existedUser= await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User already exists")
    }
// files option is given by multer like req .body given by express
// here we take the first property [0] of the array bcoz it give path property of the file
       const avatarLocalpath = req.files?.avatar?.[0]?.path;
       const coverImageLocalpath = req.files?.coverImage?.[0]?.path;
       
      

    if(!avatarLocalpath){
  
        throw new ApiError(400, "avatar file is required");
    }
      const avatar= await uploadOnCloudinary(avatarLocalpath)
      const coverImage= await uploadOnCloudinary(coverImageLocalpath)

      console.log("avatar :" ,avatar)
      if(!avatar){
        throw new ApiError(400,"avatar file is required")
      }

     const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
      })

      // here select function select exclude which is given and include all the variable
      // here we remove password and refresh token field from response
      const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
      )

      if(!createduser){
        throw new ApiError(500,"something went wrong while regestring the user")
      }

      return res.status(201).json(
        new ApiResponse(200,createduser,"user registered successfully")
      )

})

const loginUser=asyncHandler(async (req, res) => {
      //req body->data
      //username or emaail
      //find the user
      //password check
      //access and refresh
      //send cookies
      const {email,username,password}=req.body
      if(!(username || email)){
        throw new ApiError(400,"usrname or email is required")
      }

      const user=await User.findOne({
        $or:[{username},{email}]
      })

      if(!user){
        throw new ApiError(400,"user not exist")
      }

     const isPasswordValid= await user.comparePassword(password)
     
      if(!isPasswordValid){
      throw new ApiError(402,"invalid user credentials")
     }

  const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    const options={
      httpOnly:true,
      secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(200,
        {
          user:loggedInUser,accessToken,
          refreshToken
        },
        "user logged in succesfully"
      )
    )

})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken:undefined
        }
      },
      {
        new:true
      }
    )
    const options={
      httpOnly:true,
      secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out"))

})

const refreshAccessToken=asyncHandler(async(req,res)=>{

  const incomingRefreshToken=req.cookies.refreshToken ||req.body.refreshToken

  if(incomingRefreshToken){
    throw new ApiError(401,"inauthorized request")
  }


try {
   const decodedToken= jwt.verify(
      incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(401,"Invalid refresh Token")
    }
  
    if(incomingRefreshToken!==user?.refreshToken){
      throw new ApiError(401,"refresh Token is Expired")
    }
  
      const options={
        httpOnly:true,
        secure:true
      }
    const{accessToken,newRefreshToken}= await generateAccessAndRefreshTokens(user._id)
  
      return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshtoken",refreshToken,options)
      .json(
        new ApiResponse(
          200,{
            accessToken,refreshToken:newRefreshToken
          },
          "access token refreshed"
        )
      )
} catch (error) {
  throw new ApiError(401,"invalid token")
  
}

})

export { registerUser, loginUser, logoutUser, refreshAccessToken }