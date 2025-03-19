import jwt from "jsonwebtoken";
import crypto from 'crypto'
import { refreshTokenModel } from "../Models/refreshTokenModel.js";

export const generateTokens = async (user) => {

  //1. CREATE TOKEN WHICH ACCESSBLE FOR APPLICATION
  const accessToken = jwt.sign(
    { 
        userID: user._id,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail : user.email,
        userPhone: user.phone 
    },
    process.env.JWT_SECRETE,
    {expiresIn :'5m'}
  );

  //2. CREATE REFRESH TOKEN AND SAVE IN DATABASE
  const refreshToken = crypto.randomBytes(40).toString("hex")
  const refreshTokenDate = new Date()
  const expiryDate = refreshTokenDate.setDate(refreshTokenDate.getDate()+7) // 7 DAYS

  //SAVE
  const refreshTokenInDB = await refreshTokenModel.create(
    {
        token : refreshToken,
        user: user._id,
        expiresAt : expiryDate
    }
  )

  return {accessToken,refreshToken}

};
