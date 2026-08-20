import axios from 'axios';

/**
 * Uploads a file directly from the browser to the remote file storage API.
 * @param {File} file - The file object selected by the user
 * @returns {Promise<string|null>} The file key/filename returned by the storage server
 */
export const uploadFileToStorage = async (file) => {
  if (!file) return null;

  let storageUrl = (import.meta.env.VITE_FILE_STORAGE_URL || "https://file.iior-niger.in").replace(/\/+$/, "");
  if (storageUrl.startsWith("http://")) {
    storageUrl = storageUrl.replace(/^http:\/\//i, "https://");
  }

  const uploadUrl = `${storageUrl}/upload`;
  const form = new FormData();
  form.append("file", file);

  try {
    const res = await axios.post(uploadUrl, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000 // 60 seconds timeout
    });

    const key = res.data?.filename || res.data?.url || res.data?.key;
    if (!key) {
      throw new Error("File storage API returned invalid response format");
    }

    return key;
  } catch (err) {
    console.error("Direct file storage API upload error:", err);
    throw new Error(err.response?.data?.message || err.message || "Failed to upload file to storage server.");
  }
};

// Export alias for backward compatibility
export const uploadToStorageServer = uploadFileToStorage;
