import { Data } from "plotly.js";
import { useEffect, useRef, useState } from "react";

import { Box } from "@mui/material";

import { getSampleData } from "../api/data";
import { useGetElementProperty } from "../utils/ref";
import Plotly from "./Plotly";

export default function PlotWrapper() {
  const targetRef = useRef(null);
  const [data, setData] = useState<Data[]>([]);
  const [size, setSize] = useState<Array<number>>([0, 0]);
  const { getElementProperty } =
    useGetElementProperty<HTMLDivElement>(targetRef);

  const fetchData = async () => {
    const d = await getSampleData(60);
    console.log(d);
    setData([...d]);
  };

  useEffect(() => {
    const size = [getElementProperty("width"), getElementProperty("height")];
    console.log(size);
    setSize(size);
    fetchData().catch(console.error);
  }, []);

  useEffect(() => {
    console.log("data state changed");
  }, [data]);

  return (
    <Box style={{ height: "100%" }} ref={targetRef}>
      <Plotly newData={data} windowSize={size} />
    </Box>
  );
}
