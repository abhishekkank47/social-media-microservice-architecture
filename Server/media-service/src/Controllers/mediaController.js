import { uploadTocloudinary } from "../Config/Cloudinary/cloudinaryConfig.js";
import { mediaModel } from "../Models/mediaModel.js";
import { logger } from "../Utils/loggerUtil.js";
import fs from 'fs/promises'

export const uploadMedia = async (req, res) => {
  try {
    const mediaFile = req.file;
    if (!mediaFile) {
      logger.warn("Please Select an Media File");
      return res.status(400).json({
        success: false,
        message: "Please Select an Media File",
      });
    }

    //1. call cloudinary config
    const { url, publicId } = await uploadTocloudinary(mediaFile.path)

    //2. save to media Model
    const newMedia = await mediaModel.create({
        publicId,
        originalName: mediaFile.originalname,
        mimeType: mediaFile.mimetype,
        url,
        userId: req.user.userID, 
      });
  
      //3. delete from local diskstorage
      await fs.unlink(mediaFile.path)

      return res.status(201).json({
        success: true,
        message: "Media Uploaded Successfully",
        data: newMedia,
      });

  } catch (e) {

    // Delete the file even if there's an error
    if (req.file?.path) {
        await fs.unlink(req.file.path);
        logger.info(`Cleaned up file after error: ${req.file.path}`);
      } 
    }

    logger.error("Internal server Error ",e);
    return res.status(500).json({
      success: false,
      message: "Internal server Error",
    });

    

  }

