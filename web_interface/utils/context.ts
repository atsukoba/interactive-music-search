import { Data } from "plotly.js";
import { createContext } from "react";

import { ResponseDatum } from "../api/data";

interface DataContextType {
  data: Array<Data>;
  sidMapping: Map<string, string>;
}

export const DataContext = createContext<DataContextType>({
  data: [],
  sidMapping: new Map<string, string>(),
});

export const getTitleToSid = (d: ResponseDatum[]): Map<string, string> => {
  const m = new Map<string, string>();
  d.forEach((e) => {
    m.set(e.title, e.sid);
  });
  return m;
};
