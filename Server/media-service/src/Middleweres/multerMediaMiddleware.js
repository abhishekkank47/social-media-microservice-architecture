import multer from "multer";
import path from "path";

// storage
const storage = multer.diskStorage(
  {
    destination:function(req,file,cb){
      cb( null , 'src/Public/uploads/posts' )
    },
    filename:function(req,file,cb){
      cb( null , `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
  }
)

//filefilter
const fileFilter = (req,file,cb)=>{
  if(file.mimetype.startsWith('image') || file.mimetype.startsWith('video')){
    cb( null, true)
  }
  else{
    cb( new Error('Not An Valid Post'))
  }
}


// create middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
}).single("mediaFile")



// //1. create upload
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 25 * 1024 * 1024, // 25 MB
//   },
// }).single("file");

// //2. call upload
// export const uploadMiddleware = (req, res, next) => {
//   upload(req, res, (err) => {
//     if (err) {
//       logger.error("Error in Multer Middleware:", err);
//       return res.status(500).json({
//         success: false,
//         message: "Error in Multer Middleware",
//         error: err.message,
//       });
//     }
//     next();
//   });
// };
