const express = require("express");
const multer = require("multer");
const OwnerData = require("../models/OwnerData");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const bcrypt = require("bcryptjs");

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "owner_files",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
  },
});

const upload = multer({ storage });

//  Owner registration
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log("Hashed password during registration:", hashedPassword);

    const formData = {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      age: req.body.age,
      teamName: req.body.teamName,
      password: hashedPassword,
      fileUrl: req.file.path,
      points: 100,
    };

    const savedFormData = await OwnerData.create(formData);
    console.log("Owner data saved successfully:", savedFormData);
    res.status(201).json(savedFormData);
  } catch (err) {
    console.error("Error during form submission:", err);
    res
      .status(500)
      .json({ message: "Failed to save data", error: err.message });
  }
});

// all owners
router.get("/", async (req, res) => {
  try {
    const owners = await OwnerData.find();
    res.status(200).json(owners);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch owners", error: err.message });
  }
});

// UPDATE owner
router.put("/:id", async (req, res) => {
  try {
    const updatedOwner = await OwnerData.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedOwner);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update owner", error: err.message });
  }
});

// DELETE owner by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedOwner = await OwnerData.findByIdAndDelete(req.params.id);
    if (!deletedOwner) {
      return res.status(404).json({ message: "Owner not found" });
    }
    res.status(200).json({ message: "Owner deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete owner", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email, password);

  // Admin check
  if (
    email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase() &&
    password === process.env.ADMIN_PASSWORD
  ) {
    console.log("Admin login successful");
    return res.status(200).json({
      message: "Admin login successful",
      role: "admin",
      email: process.env.ADMIN_EMAIL,
    });
  }

  // Owner check
  try {
    const owner = await OwnerData.findOne({ email });

    if (!owner) {
      console.log("Owner not found");
      return res.status(400).json({ message: "Owner not found" });
    }

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ message: "Invalid password" });
    }

    console.log("Owner login successful");
    res.status(200).json({
      message: "Owner login successful",
      role: "owner",
      ownerId: owner._id,
      name: owner.name,
      teamName: owner.teamName,
      email: owner.email,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
