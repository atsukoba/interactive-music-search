import { Config, Data, Layout, PlotlyHTMLElement } from "plotly.js";

function getrandom(num: number, mul: number): number[] {
  let value = [];
  for (let i = 0; i <= num; i++) {
    let rand = Math.random() * mul;
    value.push(rand);
  }
  return value;
}

export let sampleData: Data[] = [
  {
    name: "Can't Stop - Red Hot Chili Peppers",
    opacity: 0.5,
    type: "scatter3d",
    x: getrandom(50, -75),
    y: getrandom(50, -75),
    z: getrandom(50, -75),
  },
  {
    name: "Born This Way - Lady GaGa",
    opacity: 0.5,
    type: "scatter3d",
    x: getrandom(50, -75),
    y: getrandom(50, 75),
    z: getrandom(50, 75),
  },
  {
    name: "Slide Away - Oasis",
    opacity: 0.5,
    type: "scatter3d",
    x: getrandom(50, 100),
    y: getrandom(50, 100),
    z: getrandom(50, 100),
  },
];
export let sampleLayout: Partial<Layout> = {
  // title: "Songs Data",
  hovermode: "closest",
  hoverlabel: { bgcolor: "#FFF" },
  showlegend: false,
  scene: {
    aspectmode: "manual",
    aspectratio: {
      x: 1,
      y: 1,
      z: 1,
    },
    xaxis: {
      title: "Dance",
      nticks: 20,
      range: [0, 100],
    },
    yaxis: {
      title: "ZCR",
      nticks: 20,
      range: [0, 100],
    },
    zaxis: {
      title: "Notes",
      nticks: 20,
      range: [0, 100],
    },
  },
};

export const sampleConfig: Partial<Config> = {
  responsive: true,
  displaylogo: false,
  autosizable: true,
  fillFrame: false,
};
