import { Box } from "@mui/material";
import { useGetElementProperty } from "../utils/ref";
import { useRef, useState, useEffect } from "react";
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
      <Plotly newData={undefined} windowSize={size} />
    </Box>
  );
}
