import axios from 'axios';

/**
 * Uploads a file directly from the browser to the remote file storage server.
 * @param {File} file - Browser File object
 * @returns {Promise<string|null>} The filename/key returned by the storage server
 */
export async function uploadToStorageServer(file) {
  if (!file) return null;
  const formData = new FormData();
  formData.append('file', file);

  const storageUrl = (import.meta.env.VITE_FILE_STORAGE_URL || "https://file.iior-niger.in").replace(/\/+$/, "");
  const uploadUrl = `${storageUrl}/upload`;

  console.log(`Uploading file directly from browser to file storage: ${uploadUrl} (${file.name})`);

  const response = await axios.post(uploadUrl, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  });

  if (!response.data || (!response.data.filename && !response.data.url)) {
    throw new Error('Remote file storage upload failed: Invalid response format');
  }

  const filename = response.data.filename || response.data.url;
  console.log(`Successfully uploaded file to storage: ${filename}`);
  return filename;
}
