import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
    {
        user :{
            type: mongoose.Schema.Types.ObjectId,
            ref:"users",
            required:true
        },
        content : {
            type:String,
            required:true
        },
        mediaIds :[
            {
                type:String
            }
        ],
        createdAt:{
            type:Date,
            default:Date.now
        }
    },{timestamps:true}
)

postSchema.index({content:'text'})

export const postModel = mongoose.model("posts", postSchema)