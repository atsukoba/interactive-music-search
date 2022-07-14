import { createContext } from "react";
import { Data } from "plotly.js";

export const DataContext = createContext<Array<Data>>([]);
