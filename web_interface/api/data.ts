import { PlotData } from "plotly.js";
import { features } from "process";

import { apiUrl, headers } from "./common";

interface ResponseDatum {
  title: string;
  artist: string;
  year: number | undefined;
  genre: string | undefined;
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
  const res = await fetch(`${apiUrl}/get_features_sample`, params);
  const resData = await res.json();
  const data: PlotData[] = resData.map((e: ResponseDatum) => {
    return {
      name: `${e.title} / ${e.artist}`,
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

export const getData = async (features: Array<string>) => {
  const params = {
    method: "POST",
    body: JSON.stringify({ feature_names: features }),
    headers: headers,
  };

  const res = await fetch(`${apiUrl}/get_features`, params);
  const resData = await res.json();
  const data: PlotData[] = resData.map((e: ResponseDatum) => {
    return {
      name: `${e.title} / ${e.artist}`,
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
