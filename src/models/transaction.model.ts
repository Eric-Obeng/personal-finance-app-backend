import { Schema, model } from "mongoose";

const transactionSchema = new Schema({
  // ...existing code...
  name: {
    type: String,
    required: true,
  },
  // ...existing code...
});
