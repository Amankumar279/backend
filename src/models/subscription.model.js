import mongoose, { Schema } from "mongoose";

const subscriptionSchema=new Schema({
    subscriber:{
        type: mongoose.Schema.Types.ObjectId,  // one who is suscribing
        ref: "User"
    },
    channel:{
        type: mongoose.Schema.Types.ObjectId,  // channel which is suscribed
        ref:"User"
    },
    
},{timestamps:true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema)