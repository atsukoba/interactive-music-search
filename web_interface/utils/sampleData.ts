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
    opacity: 0.4,
    type: "scatter3d",
    x: getrandom(50, -75),
    y: getrandom(50, -75),
    z: getrandom(50, -75),
  },
  {
    opacity: 0.5,
    type: "scatter3d",
    x: getrandom(50, -75),
    y: getrandom(50, 75),
    z: getrandom(50, 75),
  },
  {
    opacity: 0.5,
    type: "scatter3d",
    x: getrandom(50, 100),
    y: getrandom(50, 100),
    z: getrandom(50, 100),
  },
];
export let sampleLayout: Partial<Layout> = {
  scene: {
    aspectmode: "manual",
    aspectratio: {
      x: 1,
      y: 0.7,
      z: 1,
    },
    xaxis: {
      nticks: 9,
      range: [-200, 100],
    },
    yaxis: {
      nticks: 7,
      range: [-100, 100],
    },
    zaxis: {
      nticks: 10,
      range: [-150, 100],
    },
  },
};

export const sampleConfig: Partial<Config> = {
  responsive: true,
};
