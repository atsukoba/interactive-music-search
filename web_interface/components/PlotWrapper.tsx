import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { Box } from "@mui/material";

import { getSampleData } from "../api/data";
import { RenderMode, ScatterGL } from "../scatter_gl";
import { Dataset, Point3D, PointMetadata } from "../scatter_gl/data";
import { GLData } from "../utils/sampleData";

export default function PlotWrapper() {
  const targetRef = useRef(null);
  const [data, setData] = useState<GLData | undefined>(undefined);

  const fetchData = async () => {
    const d = await getSampleData(60);
    console.log(d);
  };

  useEffect(() => {
    const containerElement = document.getElementById("container")!;

    const data: GLData = require("../utils/scatter-gl-sample-data.json");
    const dataPoints: Point3D[] = [];
    const metadata: PointMetadata[] = [];
    data.projection.forEach((vector, index) => {
      const labelIndex = data.labels[index];
      dataPoints.push(vector);
      metadata.push({
        labelIndex,
        label: data.labelNames[labelIndex],
      });
    });
    const dataset = new Dataset(dataPoints, metadata);
    const scatterGL = new ScatterGL(containerElement, {
      onClick: (point: number | null) => {
        console.log(`click ${point}`);
      },
      onHover: (point: number | null) => {
        console.log(`hover ${point}`);
      },
      onSelect: (points: number[]) => {
        console.log(points);
      },
      renderMode: RenderMode.POINT,
      orbitControls: {
        zoomSpeed: 1.125,
      },
    });
    scatterGL.render(dataset);
    // Add in a resize observer for automatic window resize.
    window.addEventListener("resize", () => {
      scatterGL.resize();
    });
  }, []);

  useEffect(() => {
    console.log("data state changed");
  }, [data]);

  return (
    <Box style={{ height: "100%" }} ref={targetRef}>
      <canvas id="container"></canvas>
    </Box>
  );
}
