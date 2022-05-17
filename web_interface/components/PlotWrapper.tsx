import { Box } from "@mui/material";
import { useGetElementProperty } from "../utils/ref";
import { useRef, useState, useEffect } from "react";
import Plotly from "./Plotly";
import { getSampleData } from "../api/sample";
import { Data } from "plotly.js";

export default function PlotWrapper() {
  const targetRef = useRef(null);
  const [data, setData] = useState<Data[]>([]);
  const [size, setSize] = useState<Array<number>>([0, 0]);
  const { getElementProperty } =
    useGetElementProperty<HTMLDivElement>(targetRef);

  const fetchData = async () => {
    const d = await getSampleData(30);
    setData(d);
  };

  useEffect(() => {
    const size = [getElementProperty("width"), getElementProperty("height")];
    console.log(size);
    setSize(size);
    fetchData();
  }, []);

  return (
    <Box style={{ height: "100%" }} ref={targetRef}>
      <Plotly newData={data} windowSize={size} />
    </Box>
  );
}
