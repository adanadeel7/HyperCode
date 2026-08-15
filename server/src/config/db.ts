import mongoose from "mongoose";

const ConnectDB = async () => {
  try {
    const mongoURI: any = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("Mongo_ URI is not defined");
    }
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected Successfully`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Database Connection Error: ${error.message}`);
    } else {
      console.error(`Database Connection Error: ${String(error)}`);
    }
    process.exit(1);
  }
};
export default ConnectDB;
