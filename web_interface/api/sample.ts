import { Data } from "plotly.js";

const apiUrl = process.env.API_URL || "http://localhost:9823";
const headers = new Headers({
  Accept: "application/json",
  "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
});

interface ResponseDatum {
  title: string;
  artist: string;
  x: number;
  y: number;
  z: number;
}

export const getSampleData = async (n_songs: number) => {
  const params = {
    method: "POST",
    cache: "no-cache",
    body: JSON.stringify({ n_songs: n_songs }),
    headers: headers,
  };

  console.log(params)

  // data = {
  //   "title": "Song Title",
  //   "artist": "Artist Name",
  //   "x": randint(0, 100),
  //   "y": randint(0, 100),
  //   "z": randint(0, 100),
  // }

  const res = await fetch(`${apiUrl}/get_features_sample`, params);
  const resData = await res.json();
  console.log(resData);
  const data: Data[] = resData.map((e: ResponseDatum) => {
    return {
      name: `${e.artist} - ${e.artist}`,
      opacity: 0.5,
      type: "scatter3d",
      x: e.x,
      y: e.y,
      z: e.z,
    };
  });
  return data;
};
