import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    cb(null, "./public/temp")
  },
  filename: (req, file, cb) => {
  const safeName = file.originalname.replace(/\s+/g, "_");
  cb(null, Date.now() + "-" + safeName);

  }
})
// const storage = multer.diskStorage({ destination: "../../public/filesUpload",
// filename: (req, file, cb) => { cb(null, Date.now() + "-" + file.originalname); }, });



export const upload = multer({ 
    storage: storage,
    
})