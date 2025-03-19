import mongoose from 'mongoose'

const refreshToken = new mongoose.Schema({
    token : {
        type: String,
        required :true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    expiresAt :{
        type:Date,
        required:true
    }
},{timestamps:true})

refreshToken.index({expiresAt:1}, {expiresAfterSeconds : 0})

export const refreshTokenModel = mongoose.model("refreshTokens",refreshToken)