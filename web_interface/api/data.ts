import { Data } from "plotly.js";

import { apiUrl, headers } from "./common";

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
    body: JSON.stringify({ n_songs: n_songs }),
    headers: headers,
  };

  // data = {
  //   "title": "Song Title",
  //   "artist": "Artist Name",
  //   "x": randint(0, 100),
  //   "y": randint(0, 100),
  //   "z": randint(0, 100),
  // }

  const res = await fetch(`${apiUrl}/get_features_sample`, params);
  const resData = await res.json();
  const data: Data[] = resData.map((e: ResponseDatum) => {
    return {
      name: e.title,
      text: [`${e.artist} - ${e.title}`],
      mode: "markers",
      opacity: [0.5],
      type: "scatter3d",
      x: [e.x],
      y: [e.y],
      z: [e.z],
      hovertemplate: [
        "<b>%{text}</b><br><br>" +
          "%{xaxis.title.text}: %{x}<br>" +
          "%{yaxis.title.text}: %{y}<br>" +
          "%{zaxis.title.text}: %{z}<br>" +
          "<extra></extra>",
      ],
    };
  });
  return data;
};
