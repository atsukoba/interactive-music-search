import { Data } from "plotly.js";
import { createContext } from "react";

import { ResponseDatum } from "../api/data";

interface DataContextType {
  data: Array<ResponseDatum>;
}

export const DataContext = createContext<DataContextType>({
  data: []
});

export const getTitleToSid = (d: ResponseDatum[]): Map<string, string> => {
  const m = new Map<string, string>();
  d.forEach((e) => {
    m.set(e.title, e.sid);
  });
  return m;
};

export const calcMappingCoordinates = (
  data: ResponseDatum[],
  scaling: number = 1.0
): ResponseDatum[] => {
  let meanX: number = 0;
  let meanY: number = 0;
  let meanZ: number = 0;
  const dataLen = data.length;
  console.log(dataLen);
  data.forEach((d) => {
    meanX += d.x / dataLen;
    meanY += d.y / dataLen;
    meanZ += d.z / dataLen;
  });
  console.log([meanX, meanY, meanZ]);
  return data.map((d) => {
    return {
      ...d,
      x: (d.x - meanX) * scaling,
      y: (d.y - meanY) * scaling,
      z: (d.z - meanZ) * scaling,
    };
  });
};
