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
import React, { useContext, useEffect, useRef, useState } from "react";

import { useGetElementProperty } from "../utils/ref";
import { sampleConfig, sampleData, sampleLayout } from "../utils/sampleData";
import SpotifyPlayer from "./SpotifyPlayer";

declare global {
  interface Window {
    onSpotifyIframeApiReady: (IFrameAPI: any) => void;
    trustedTypes: any;
    SpotifyIframeConfig: any;
  }
}

// avoid error on using react-plotly on Next with typescript
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

function unpack(rows: { [key: string]: number }[], key: string) {
  return rows.map(function (row) {
    return row[key];
  });
}

interface IProps {
  newData: Data[];
  sidMapping: Map<string, string>;
  windowSize: Array<number>;
}

interface BBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface PlotMouseEventPoint3D {
  bbox: BBox;
  data: ScatterData;
}

interface PlotMouseEvent3D {
  points: Array<PlotMouseEventPoint3D>;
}

const Plotly = ({ newData, sidMapping, windowSize }: IProps) => {
  const [layout, setlayout] = useState<Partial<Layout>>({});
  const [currentTrackId, setCurrentTrackId] = useState("");

  console.log(newData);
  console.log(sidMapping);

  useEffect(() => {
    sampleLayout.width = windowSize[0];
    sampleLayout.height = windowSize[1];
    console.log("props", newData);
    setlayout(sampleLayout);
  }, []);

  const onClickDataPoint = (e: any) => {
    // NOTE: defined types of PlotMouseEvent are incorrect
    let x = e.points[0].bbox.x0 + e.points[0].bbox.x1;
    let y = e.points[0].bbox.y0 + e.points[0].bbox.y1;
    console.log("Clicked Song: ", e.points[0].data);
    console.log("Position", x, y);
    const sid = sidMapping.get(e.points[0].data.name)!;
    console.log(sid);
    setCurrentTrackId(sid);

    // window.onSpotifyIframeApiReady = (IFrameAPI: any) => {
    //   let element = document.getElementById("embed-iframe");
    //   let options = {
    //     uri: `spotify:track:${sid}`,
    //   };
    //   let callback = (EmbedController: any) => {};
    //   IFrameAPI.createController(element, options, callback);
    // };
  };

  return (
    <>
      <Plot
        data={newData}
        layout={layout}
        config={sampleConfig}
        style={{ width: "100%", height: "calc(100% - 80px)" }}
        onClick={onClickDataPoint}
      />
      <SpotifyPlayer track_id={currentTrackId} />
    </>
  );
};

export default Plotly;
