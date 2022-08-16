import { Data } from "plotly.js";
import { useEffect, useRef, useState } from "react";

import { Box } from "@mui/material";

import { DataContext } from "../utils/context";
import { useGetElementProperty } from "../utils/ref";
import PointsViewer from "./PointsViewer";

export default function PlotWrapper() {
  return (
    <Box style={{ height: "100%" }}>
      <DataContext.Consumer>
        {(d) => <PointsViewer newData={d.data} />}
      </DataContext.Consumer>
    </Box>
  );
}
