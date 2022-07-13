import { ScatterBoard, Lazy } from "react-scatter-board";

export function Scatter() {
  const colWidth = 2000;
  const colHeight = 1000;

  return (
    <Lazy loading={<div>Loading...</div>}>
      {() =>
        fetch("https://amp.pharm.mssm.edu/scavi/graph/GSE48968/tSNE/3")
          .then((response) => response.json())
          .then((data) => (
            <ScatterBoard
              data={data}
              shapeKey="strain"
              colorKey="description"
              labelKeys={["sample_id", "description"]}
              searchKeys={["sample_id", "description", "source_name_ch1"]}
              is3d={true}
              width={colWidth}
              height={colHeight}
            />
          ))
      }
    </Lazy>
  );
}
