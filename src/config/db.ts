import mongoose from "mongoose";

const uri: string =
  "mongodb+srv://obengeric:obengeric1@personal-finance-app.r1q51.mongodb.net/personal-finance-app?retryWrites=true&w=majority&appName=personal-finance-app";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    console.log("MongoDB Connected using Mongoose");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
