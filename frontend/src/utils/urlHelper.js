export const getServerUrl = (path) => {
  if (!path) return "";

  // If it's already a full URL
  if (path.startsWith("http")) {
    // If it's a legacy localhost/127.0.0.1 link, replace it with the production base URL
    if (path.includes("localhost:") || path.includes("127.0.0.1:")) {
      const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
      return path.replace(/^https?:\/\/[^/]+/, baseUrl);
    }
    return path;
  }

  // Check if it's a file storage key (doesn't contain slashes or doesn't start with /uploads)
  const isKey = !path.includes('/') || (!path.startsWith('uploads') && !path.startsWith('/uploads'));

  if (isKey) {
    const storageUrl = import.meta.env.VITE_FILE_STORAGE_URL || "https://file.iior-niger.in";
    const cleanStorageUrl = storageUrl.replace(/\/+$/, "");
    const cleanPath = path.replace(/^\/+/, "");
    return `${cleanStorageUrl}/uploads/${cleanPath}`;
  }

  const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
};