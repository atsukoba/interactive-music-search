export const apiUrl = process.env.API_URL || "http://localhost:9823";
export const headers = new Headers({
  Accept: "application/json",
  "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
});
