import { userModel } from "../Models/UserModel.js";
import { generateTokens } from "../Utils/generateToken.js";
import argon2 from "argon2";
import { logger } from "../Utils/loggerUtil.js";
import { loginValidator, registerValidator } from "../Utils/validationUtil.js";
import { refreshTokenModel } from "../Models/refreshTokenModel.js";

//register controller
export const registerController = async (req, res) => {
  try {
    //VALIDATON BY VALIDATOR
    const { error } = registerValidator(req.body);
    if (error) {
      logger.warn("Validation Error : ", { error: error.message });
      return res.status(400).json({
        success: false,
        message: "Validation error",
      });
    }

    const { firstName, lastName, email, phone, password } = req.body;

    //EXISTENCE OF USER
    const userExist = await userModel.findOne({ email });
    if (userExist) {
      logger.warn("User Already Exist, please Log in");
      return res.status(400).json({
        success: false,
        message: "User Already Exist, please Log in",
      });
    }

    //PASSWORD HASHING
    const hashedPassword = await argon2.hash(password);

    //SAVE NEW USER WITH TOKEN GENERATION
    const user = await userModel.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });
    logger.info("Registered Successfully", user._id);

    //TOKEN GENERATE
    const { accessToken, refreshToken } = await generateTokens(user);

    return res.status(201).json({
      success: true,
      message: "REGISTERED SUCCESFULLY",
      accessToken,
      refreshToken,
    });
  } catch (e) {
    logger.error("Registraton Error", e);
    return res.status(500).json({
      success: false,
      message: `INTERNAL SERVER ERROR`,
    });
  }
};

//login controller
export const loginController = async (req, res) => {
  try {
    //VALIDATION
    const { error } = loginValidator(req.body);
    if (error) {
      logger.warn("Validation Error : ", { error: error.message });
      return res.status(400).json({
        success: false,
        message: `Validation error`,
      });
    }
    const { email, password } = req.body;

    //EXISTENCE OF EMAIL
    const user = await userModel.findOne({ email });
    if (!user) {
      logger.warn(`Not a Registered Email ID`);
      return res.status(400).json({
        success: false,
        message: "Not a Registered Email ID",
      });
    }

    //PASSWORD COMPARE
    const comparePassword = await argon2.verify(user.password, password);
    if (!comparePassword) {
      logger.warn(`Invalid Password, Please Try Again`);
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    //GENERATE ACESSES AND REFRESH TOKEN
    const { accessToken, refreshToken } = await generateTokens(user);

    //succsses
    res.status(200).json({
      success: true,
      message: `${user.firstName} LOGGED IN SUCCESSFULLY`,
      accessToken,
      refreshToken,
      userId : user._id
    });
  } catch (e) {
    logger.error("Error in Login : ", e);
    res.status(500).json({
      success: false,
      message: `INTERNAL SERVER ERROR`,
    });
  }
};

//refresh token controller
export const refreshTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    //validation
    if (!refreshToken) {
      logger.warn(`Refresh Token missing`);
      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    //existence
    const storedToken = await refreshTokenModel.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn(`Invalid refresh Token or Expired Token`);
      return res.status(401).json({
        success: false,
        message: `Invalid or expired refresh token`,
      });
    }

    //user associated to token existence
    const user = await userModel.findById(storedToken.user);
    if (!user) {
      logger.warn(`User not found`);
      return res.status(401).json({
        success: false,
        message: `User not found`,
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);

    //delete the old refresh token
    await refreshTokenModel.deleteOne({ _id: storedToken._id });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (e) {
    logger.error("Error in Login : ", e);
    res.status(500).json({
      success: false,
      message: `INTERNAL SERVER ERROR`,
    });
  }
};

//logout controller
export const logoutUserController = async (req, res) => {
  logger.info("Logout endpoint hit...");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    //existence
    const token = await refreshTokenModel.findOne({ token: refreshToken });
    if (!token) {
        logger.warn("Refresh token not Exist or already deleted");
        return res.status(400).json({
          success: false,
          message: "Refresh token not Exist or already deleted",
        });
      }

    await refreshTokenModel.deleteOne({ token: refreshToken });
    logger.info("Refresh token deleted for logout");

    res.json({
      success: true,
      message: "Logged out successfully!",
    });
  } catch (e) {
    logger.error("Error while logging out", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
