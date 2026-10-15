const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|svg/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, webp, svg) are allowed!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

// @route   POST /api/upload
// @desc    Upload product image file
// @access  Private (Admin only)
router.post('/', protect, isAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: err.message,
    });
  }
});

module.exports = router;
