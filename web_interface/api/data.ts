import { PlotData } from "plotly.js";

import { apiUrl, headers } from "./common";

export interface ResponseDatum {
  sid: string;
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

export const getData = async (
  features: Array<string>,
  n_songs: number,
  method: string,
  genres: Array<string>,
  year_range: Array<number>
) => {
  const params = {
    method: "POST",
    body: JSON.stringify({
      feature_names: features,
      n_songs: n_songs,
      method: method,
      genres: genres,
      year_range: year_range,
    }),
    headers: headers,
  };

  const res = await fetch(`${apiUrl}/get_features`, params);
  const resData: ResponseDatum[] = await res.json();
  return resData;
};

export const responseToPlotlyData = (
  resData: ResponseDatum[]
): Partial<PlotData>[] => {
  const data: Partial<PlotData>[] = resData.map((e: ResponseDatum) => {
    return {
      name: e.title,
      text: `${e.artist} - ${e.title}`,
      mode: "markers",
      opacity: 0.5,
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
      i: undefined,
      j: undefined,
      k: undefined,
      xy: undefined,
      error_x: undefined,
      error_y: undefined,
      xaxis: undefined,
      yaxis: undefined,
      lat: undefined,
      lon: undefined,
      line: undefined,
    };
  });
  return data;
};
