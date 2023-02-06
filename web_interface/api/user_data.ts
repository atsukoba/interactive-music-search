import { apiUrl, headers } from "./common";

export const postUserFile = async (data: FormData) => {
  const params = {
    method: "POST",
    body: JSON.stringify({
      file: data,
    }),
    headers: headers,
  };
  const res = await fetch(`${apiUrl}/user_data`, params);
  const resData = await res.json();
  return resData;
};
