import dotenv from "dotenv";
import { connectDB } from "./src/config/db";
import { app } from "./app";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Error starting server:", error); // Add detailed error logging
    process.exit(1);
  }
};

startServer();
