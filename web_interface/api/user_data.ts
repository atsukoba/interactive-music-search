import { apiUrl, blobHeaders } from "./common";

interface IRes {
  fileName: string;
}

export const postUserFile = async (
  file_name: string,
  payload: Blob,
  filetype: string
): Promise<IRes> => {
  const data = new FormData();
  data.append(
    "file",
    payload,
    file_name + (filetype === "audio" ? ".wav" : "")
  );
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
