const multer = require('multer');

// Configure multer to store files in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 1024 } // 1GB limit
});

const FormData = require('form-data');
const axios = require('axios');

/**
 * Uploads a single file buffer to the remote storage server.
 * @param {Object} file - Multer file object from memory storage
 * @returns {Promise<string|null>} The URL of the uploaded file, or null if no file
 */
async function uploadToStorageServer(file) {
    if (!file || !file.buffer) return null;

    const form = new FormData();
    form.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
    });

    try {
        const baseUrl = process.env.VITE_FILE_STORAGE_URL || 'https://file.iior-niger.in';
        const uploadUrl = `${baseUrl.replace(/\/+$/, '')}/upload`;
        const response = await axios.post(uploadUrl, form, {
            headers: {
                ...form.getHeaders()
            },
            adapter: 'http' // Force http adapter instead of fetch in Node 22+
        });

        if (!response.data.filename) {
            throw new Error('Remote upload response missing filename');
        }

        return response.data.filename;
    } catch (err) {
        throw new Error(`Remote upload failed: ${err.response ? err.response.statusText : err.message}`);
    }
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
