const express = require("express");
const multer = require("multer");
const path = require("path");
// const fs = require("fs");
const FormData = require("../models/FormData");
const cloudinary =require("cloudinary").v2;


const router = express.Router();
cloudinary.config({
 cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
 api_key:process.env.CLOUDINARY_API_KEY,
 api_secret:process.env.CLOUDINARY_API_SECRET,
})


// Ensure uploads directory exists
const uploadsDirectory = path.join(__dirname, "uploads");

// if (!fs.existsSync(uploadsDirectory)) {
//   fs.mkdirSync(uploadsDirectory, { recursive: true });
// }

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirectory); // Save to the uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate unique file names
  },
});

const upload = multer({ dest:"uploads/" });

// Route to handle form data and file upload
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Path to the uploaded file
    const filePath = req.file.path;

const result =await cloudinary.uploader.upload(filePath,{
  folder:"uploads"
})    
// fs.unlinkSync(filePath)

    // Form data object
    const formData = {
      name: req.body.name,
      phone: req.body.phone,
      age: req.body.age,
      playerStyle: req.body.playerStyle,
      jerseySize: req.body.jerseySize,
      shirtNumber: req.body.shirtNumber,
      fileUrl: result.secure_url,
    };


    await FormData.create(formData);

    res.status(201).json(formData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save data", error: err });
  }
});

// Route to get all form data
router.get("/", async (req, res) => {
  try {
    const allData = await FormData.find();
    res.status(200).json(allData);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch data", error: err });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedData = await FormData.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedData);
  } catch (err) {
    res.status(500).json({ message: "Failed to update data", error: err });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await FormData.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete data", error: err });
  }
});

module.exports = router;
