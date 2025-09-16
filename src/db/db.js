import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
   const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log(`Connected to mongoDB: ${connectionInstance.connection.host}`);
 

} catch (error) {
    console.log("Error while connecting to mongoDB", error);
    process.exit(1);
}
};

export default connectDB;