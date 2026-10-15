const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure Multer memory storage for direct streaming to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow all standard image mime types
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, GIF, SVG) are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB maximum file size
  },
  fileFilter
});

/**
 * Upload an image buffer or Base64/DataURI/URL directly to Cloudinary
 * @param {Buffer|string} fileSource - Buffer from multer or Base64 data string / image URL
 * @param {Object} options - Custom Cloudinary options (folder, transformation, etc.)
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (fileSource, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'last_dance_candidates',
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      ...options
    };

    // If fileSource is a Buffer (from Multer memory storage)
    if (Buffer.isBuffer(fileSource)) {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('[Cloudinary] Upload stream error:', error);
            return reject(error);
          }
          resolve(result);
        }
      );

      const readable = Readable.from(fileSource);
      readable.pipe(uploadStream);
    } 
    // If fileSource is a Base64 string, Data URI, or remote HTTP URL
    else if (typeof fileSource === 'string') {
      cloudinary.uploader.upload(fileSource, uploadOptions)
        .then(result => resolve(result))
        .catch(error => {
          console.error('[Cloudinary] Upload string error:', error);
          reject(error);
        });
    } else {
      reject(new Error('Invalid image source provided. Must be Buffer or Base64/URL string.'));
    }
  });
};

module.exports = {
  cloudinary,
  upload,
  uploadToCloudinary
};
