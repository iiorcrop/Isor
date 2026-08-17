export const getServerUrl = (path) => {
  if (!path) return "";

  const storageUrl = (import.meta.env.VITE_FILE_STORAGE_URL || "https://file.iior-niger.in").replace(/\/+$/, "");

  let queryString = "";
  let cleanPath = String(path).trim();

  const queryIdx = cleanPath.indexOf("?");
  if (queryIdx !== -1) {
    queryString = cleanPath.substring(queryIdx);
    cleanPath = cleanPath.substring(0, queryIdx);
  }

  let filename = cleanPath;
  if (cleanPath.includes("/")) {
    filename = cleanPath.split("/").pop();
  }

  if (!filename) return "";

  return `${storageUrl}/uploads/${filename}${queryString}`;
};


