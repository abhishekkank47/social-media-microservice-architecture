import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName:{
            type: String,
            required: true,
            trim: true
        },
        lastName:{
            type: String,
            required: true,
            trim: true
        },
        email:{
            type: String,
            required: true,
            // unique: true ---> removed beacuse scheam.index({email}) have same purpose
            trim: true,
            lowercase: true
        },
        phone:{
            type: String,
            required: true
        },
        password:{
            type: String,
            required: true
        }
    },{timestamps:true}
)

userSchema.index({email:1}) //mongodb Indexing --> uses Btree for fast retrival of data

export const userModel = mongoose.model("users",userSchema )