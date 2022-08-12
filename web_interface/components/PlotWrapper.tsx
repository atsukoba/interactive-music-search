import { Data } from "plotly.js";
import { useEffect, useRef, useState } from "react";

import { Box } from "@mui/material";

import { getSampleData } from "../api/data";
import { DataContext } from "../utils/context";
import { useGetElementProperty } from "../utils/ref";
import Plotly from "./Plotly";
import PointsViewer from "./PointsViewer";

export default function PlotWrapper() {
  const targetRef = useRef(null);
  const [size, setSize] = useState<Array<number>>([0, 0]);
  const { getElementProperty } =
    useGetElementProperty<HTMLDivElement>(targetRef);

  useEffect(() => {
    const size = [getElementProperty("width"), getElementProperty("height")];
    setSize(size);
  }, []);

  return (
    <Box ref={targetRef} style={{ height: "100%" }}>
      <DataContext.Consumer>
        {(d) => <PointsViewer newData={d.data} sidMapping={d.sidMapping} />}
      </DataContext.Consumer>
    </Box>
  );
}
