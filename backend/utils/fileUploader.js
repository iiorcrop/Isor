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
        
        console.log(`Attempting remote upload to: ${uploadUrl}`);
        const response = await axios.post(uploadUrl, form, {
            headers: {
                ...form.getHeaders()
            },
            adapter: 'http', // Force http adapter instead of fetch in Node 22+
            timeout: 8000 // 8 second timeout to prevent 504 Gateway Timeout hanging
        });

        if (!response.data.filename) {
            throw new Error('Remote upload response missing filename');
        }

        return response.data.filename;
    } catch (err) {
        console.warn(`Remote upload failed: ${err.message}. Falling back to local storage...`);
        
        try {
            const fs = require('fs');
            const path = require('path');
            const crypto = require('crypto');
            
            const ext = path.extname(file.originalname) || '.png';
            const filename = crypto.randomUUID() + ext;
            const uploadDir = path.join(__dirname, '..', 'uploads');
            
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
            console.log(`Successfully saved file locally as: ${filename}`);
            
            // Return with /uploads/ prefix so frontend uses backend URL instead of remote storage URL
            return `/uploads/${filename}`;
        } catch (localErr) {
            throw new Error(`Remote and local upload both failed. Local Error: ${localErr.message}`);
        }
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
