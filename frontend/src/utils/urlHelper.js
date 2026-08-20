export const getServerUrl = (path) => {
  if (!path) return "";

  const storageUrl = (import.meta.env.VITE_FILE_STORAGE_URL || "https://file.iior-niger.in").replace(/\/+$/, "");

  let queryString = "";
  let cleanPath = String(path).trim();

  // Extract query string if any
  const queryIdx = cleanPath.indexOf("?");
  if (queryIdx !== -1) {
    queryString = cleanPath.substring(queryIdx);
    cleanPath = cleanPath.substring(0, queryIdx);
  }

  // Extract pure filename
  let filename = cleanPath;
  if (cleanPath.includes("/")) {
    filename = cleanPath.split("/").pop();
  }

  if (!filename) return "";

  // Return full remote file storage URL
  return `${storageUrl}/uploads/${filename}${queryString}`;
};