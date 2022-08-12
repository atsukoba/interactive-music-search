import { MathUtils } from "three";
import { Dispatch, SetStateAction, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Points,
  Point,
  PointMaterial,
  OrbitControls,
  GizmoHelper,
  GizmoViewport,
  GizmoViewcube,
} from "@react-three/drei";
import { useControls } from "leva";
import { Data, PlotData } from "plotly.js";
import SpotifyPlayer from "./SpotifyPlayer";

// const positions = Array.from({ length: 2000 }, (i) => [
//   MathUtils.randFloatSpread(100),
//   MathUtils.randFloatSpread(100),
//   MathUtils.randFloatSpread(100),
// ]);

declare global {
  interface Window {
    onSpotifyIframeApiReady: (IFrameAPI: any) => void;
    trustedTypes: any;
    SpotifyIframeConfig: any;
  }
}

interface IProps {
  newData: PlotData[];
  sidMapping: Map<string, string>;
}

export default function PointsViewer({ newData, sidMapping }: IProps) {
  const positions = newData;
  console.log(positions);
  console.log(positions.length);
  // states
  const [currentTrackId, setCurrentTrackId] = useState("");
  // const { range } = useControls({
  //   range: { value: positions.length / 2, min: 0, max: positions.length },
  // });

  return (
    <>
      <Canvas
        resize={{ scroll: true, debounce: { scroll: 10, resize: 0 } }}
        raycaster={{ params: { Points: { threshold: 0.175 } } }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 50] }}
        style={{ width: "100%", height: "calc(100% - 100px)" }}
      >
        <Points limit={100000} range={positions.length}>
          <PointMaterial
            transparent={true}
            vertexColors={true}
            size={2}
            sizeAttenuation={true}
            depthWrite={false}
          />
          {positions.map((d, i) => {
            // console.log(d);
            const pos = [
              (d.x[0] as number) - 50,
              (d.y[0] as number) - 50,
              (d.z[0] as number) - 50,
            ];
            return (
              <PointEvent
                key={i}
                position={pos}
                data={d}
                sidMapping={sidMapping}
                setSidFunc={setCurrentTrackId}
              />
            );
          })}
        </Points>
        <OrbitControls />
        <GizmoHelper
          alignment="bottom-right" // widget alignment within scene
          margin={[80, 80]} // widget margins (X, Y)
          // onUpdate={/* called during camera animation  */}
          // onTarget={/* return current camera target (e.g. from orbit controls) to center animation */}
          // renderPriority={/* use renderPriority to prevent the helper from disappearing if there is another useFrame(..., 1)*/}
        >
          {/* <GizmoViewport
            axisColors={["red", "green", "blue"]}
            labelColor="black"
          /> */}
          <GizmoViewcube />
        </GizmoHelper>
      </Canvas>
      <SpotifyPlayer track_id={currentTrackId} />
    </>
  );
}

interface IPropsPointEvent {
  key: number;
  position: number[];
  data: PlotData;
  sidMapping: Map<string, string>;
  setSidFunc: Dispatch<SetStateAction<string>>;
}

function PointEvent({
  key,
  position,
  data,
  sidMapping,
  setSidFunc,
}: IPropsPointEvent) {
  const [hovered, setHover] = useState(false);
  const [clicked, setClick] = useState(false);
  return (
    <Point
      key={key}
      color={clicked ? "hotpink" : hovered ? "yellow" : "orange"}
      onPointerOver={(e: any) => (e.stopPropagation(), setHover(true))}
      onPointerOut={(e: any) => setHover(false)}
      onClick={(e: any) => {
        e.stopPropagation();
        setClick((state) => !state);
        setSidFunc(sidMapping.get(data.name)!);
      }}
      position={position}
    />
  );
}
