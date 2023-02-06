import { apiUrl, blobHeaders } from "./common";

interface IRes {
  fileName: string;
}

export const postUserFile = async (
  payload: Blob,
  filetype: string
): Promise<IRes> => {
  const data = new FormData();
  data.append("file", payload, "file");
  const params = {
    method: "POST",
    body: data,
    // headers: blobHeaders,
  };
  const res: Response = await fetch(`${apiUrl}/user_data/${filetype}`, params);
  console.log("Response: ");
  console.dir(res);
  return res.json();
};
