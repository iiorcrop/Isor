const multer = require('multer');

// Configure multer to store files in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 1024 } // 1GB limit
});

/**
 * Uploads a single file buffer to the remote storage server.
 * @param {Object} file - Multer file object from memory storage
 * @returns {Promise<string|null>} The URL of the uploaded file, or null if no file
 */
async function uploadToStorageServer(file) {
    if (!file || !file.buffer) return null;

    const blob = new Blob([file.buffer], { type: file.mimetype });
    const formData = new FormData();
    formData.append('file', blob, file.originalname);

    const response = await fetch('https://file.iior-niger.in/upload', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Remote upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.filename) {
        throw new Error('Remote upload response missing filename');
    }

    return data.filename;
}

/**
 * Uploads multiple file buffers to the remote storage server in parallel.
 * @param {Array<Object>} files - Array of Multer file objects
 * @returns {Promise<Array<string>>} Array of uploaded URLs
 */
async function uploadMultipleToStorageServer(files) {
    if (!files || !Array.isArray(files) || files.length === 0) return [];
    
    const uploadPromises = files.map(file => uploadToStorageServer(file));
    return Promise.all(uploadPromises);
}

module.exports = {
    upload,
    uploadToStorageServer,
    uploadMultipleToStorageServer
};
