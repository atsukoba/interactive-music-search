import * as d3 from "d3";
import dynamic from "next/dynamic";
import {
  Data,
  Datum,
  Layout,
  PlotMouseEvent,
  ScatterData,
  ScatterMarker,
} from "plotly.js";
import React, { useEffect, useRef, useState } from "react";
import { useGetElementProperty } from "../utils/ref";
import { sampleData, sampleLayout, sampleConfig } from "../utils/sampleData";

// avoid error on using react-plotly on Next with typescript
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

function unpack(rows: { [key: string]: number }[], key: string) {
  return rows.map(function (row) {
    return row[key];
  });
}

interface IProps {
  newData: Data[];
  windowSize: Array<number>;
}

const Plotly = ({ newData, windowSize }: IProps) => {
  const [layout, setlayout] = useState<Partial<Layout>>({});
  const onClickDataPoint = (e: PlotMouseEvent) => {
    console.log("Clicked Song: ", e.points[0].data);
  };
  useEffect(() => {
    sampleLayout.width = windowSize[0];
    sampleLayout.height = windowSize[1];
    console.log("props", newData);
    setlayout(sampleLayout);
  }, []);
  return (
    <Plot
      data={newData}
      layout={layout}
      config={sampleConfig}
      style={{ width: "100%", height: "100%" }}
      onClick={onClickDataPoint}
    />
  );
};

export default Plotly;
