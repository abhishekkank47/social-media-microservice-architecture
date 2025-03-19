import {v2 as cloudinary} from "cloudinary"
import {logger} from '../../Utils/loggerUtil.js'
import dotenv from "dotenv"
dotenv.config()

export const cloudinaryConfig = cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRETE_KEY
    }
)

//file ---> cloudinary Url
export const uploadTocloudinary = async(file)=>{
    try {
        const result = await cloudinary.uploader.upload(file)
        return {
            publicId: result.public_id,
            url: result.secure_url
        }
    } catch (e) {
        logger.error('Error in File Uploading to Cloudinary', e)
        
    }
}

//delete ---> cloudinary Url
export const deleteUrlFromCloudinary = async(publicId)=>{
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        logger.info(`${publicId} File is Deleted Succesfully from Cloudinary`)
        return result
    } catch (e) {
        logger.error('Error in delete Url from cloudinary ', e)
    }
}