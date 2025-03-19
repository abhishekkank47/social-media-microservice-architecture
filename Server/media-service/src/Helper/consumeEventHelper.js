import mongoose from "mongoose";
import { deleteUrlFromCloudinary } from "../Config/Cloudinary/cloudinaryConfig.js";
import { mediaModel } from "../Models/mediaModel.js";
import { logger } from "../Utils/loggerUtil.js";

export const consumeEventHelper = async (event) => {
  try {
    //1. coming from post service event publish message
    const { postId, userId, mediaIds } = event;

    //2. find object in db
    
    const mediaDelete = await mediaModel.find({ publicId: { $in: mediaIds } });

    //3. loop to a db response
    for(const m of mediaDelete){
        //call cloudinary delete function
        await deleteUrlFromCloudinary(m.publicId)
        //delete from db
        await mediaModel.findByIdAndDelete(m._id)

        logger.info(`Deleted Media ${mediaIds} from post ${postId}`)
    }

  } catch (e) {
    logger.error("error in event Consumption", e);
  }
};
