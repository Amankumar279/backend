import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
 import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
  console.log("email:", email)

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
       const  avatarLocalpath = req.files?.avatar?.[0]?.path;
       const coverImageLocalpath = req.files?.coverImage?.[0]?.path;
       console.log("avatarLocalpath:", avatarLocalpath)
    if(!avatarLocalpath){
  
        throw new ApiError(400, "avatar file is required");
    }
      const avatar= await uploadOnCloudinary(avatarLocalpath)
      const coverImage= await uploadOnCloudinary(coverImageLocalpath)


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
export default registerUser;