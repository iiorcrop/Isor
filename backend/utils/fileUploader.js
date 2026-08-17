const multer = require("multer");
const FormData = require("form-data");
const axios = require("axios");

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB limit
});

/**
 * Uploads a single file buffer directly to the remote file storage server (no local fallback).
 * @param {Object} file - Multer file object from memory storage
 * @returns {Promise<string|null>} The URL / filename of the uploaded file on remote storage, or null if no file
 */
async function uploadToStorageServer(file) {
  if (!file || !file.buffer) return null;

  const form = new FormData();
  form.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  let baseUrl =
    process.env.FILE_STORAGE_INTERNAL_URL || process.env.VITE_FILE_STORAGE_URL || "https://file.iior-niger.in";
  if (baseUrl.startsWith("http://")) {
    baseUrl = baseUrl.replace(/^http:\/\//i, "https://");
  }
  const uploadUrl = `${baseUrl.replace(/\/+$/, "")}/upload`;

  console.log(`Uploading file to remote storage server: ${uploadUrl} (${file.originalname})`);

  try {
    const response = await axios.post(uploadUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
      adapter: "http", // Force http adapter instead of fetch in Node 22+
      timeout: 60000, // 60 second timeout for file storage uploads
    });

    console.log("Response ", response);

    if (!response.data || (!response.data.filename && !response.data.url)) {
      throw new Error("Remote file storage upload failed: Invalid response format");
    }

    const filename = response.data.filename || response.data.url;
    console.log(`Successfully uploaded file to remote storage: ${filename}`);
    return filename;
  } catch (err) {
    console.log(err);
    console.error(`Remote file storage upload failed for ${file.originalname}:`, err.message);
    throw new Error(`File storage upload failed: ${err.message}`);
  }
}

/**
 * Uploads multiple file buffers to the remote file storage server in parallel.
 * @param {Array<Object>} files - Array of Multer file objects
 * @returns {Promise<Array<string>>} Array of uploaded filenames
 */
async function uploadMultipleToStorageServer(files) {
  if (!files || !Array.isArray(files) || files.length === 0) return [];

  const uploadPromises = files.map((file) => uploadToStorageServer(file));
  return Promise.all(uploadPromises);
}

module.exports = {
  upload,
  uploadToStorageServer,
  uploadMultipleToStorageServer,
};
