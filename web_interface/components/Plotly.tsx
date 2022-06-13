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

interface BBox {
  x0: float;
    x1: float;
    y0: float;
    y1: float;
}

interface PlotMouseEventPoint3D {
  bbox: BBox;
  data: ScatterData;
}

interface PlotMouseEvent3D {
  points: Array<PlotMouseEventPoint3D>;
}

const onClickDataPoint = (e: PlotMouseEvent3D) => {
  let x = e.points[0].bbox.x0 + e.points[0].bbox.x1
  let y = e.points[0].bbox.y0 + e.points[0].bbox.y1
  console.log("Clicked Song: ", e.points[0].data);
};

const Plotly = ({ newData, windowSize }: IProps) => {
  const [layout, setlayout] = useState<Partial<Layout>>({});
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
