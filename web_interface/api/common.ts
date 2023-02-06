export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:9823";
console.log("API URL is set to " + apiUrl);

export const headers = new Headers({
  Accept: "application/json",
  "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
});

export const blobHeaders = new Headers({
  Accept: "audio/*",
  "Content-Type": "multipart/form-data; charset=utf-8",
});
