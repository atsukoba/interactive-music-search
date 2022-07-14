import { Data } from "plotly.js";
import { useEffect, useRef, useState } from "react";

import { Box } from "@mui/material";

import { getSampleData } from "../api/data";
import { DataContext } from "../utils/context";
import { useGetElementProperty } from "../utils/ref";
import Plotly from "./Plotly";

export default function PlotWrapper() {
  const targetRef = useRef(null);
  const [size, setSize] = useState<Array<number>>([0, 0]);
  const { getElementProperty } =
    useGetElementProperty<HTMLDivElement>(targetRef);

  useEffect(() => {
    const size = [getElementProperty("width"), getElementProperty("height")];
    console.log(size);
    setSize(size);
  }, []);

  return (
    <Box style={{ height: "100%" }} ref={targetRef}>
      <DataContext.Consumer>
        {(d) => <Plotly newData={d} windowSize={size} />}
      </DataContext.Consumer>
    </Box>
  );
}
