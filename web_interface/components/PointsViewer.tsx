// @ts-nocheck
import { Dispatch, SetStateAction, useState } from "react";
import { MathUtils } from "three";

import {
  GizmoHelper,
  GizmoViewcube,
  GizmoViewport,
  OrbitControls,
  Point,
  PointMaterial,
  Points,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { ResponseDatum } from "../api/data";
import { calcMappingCoordinates } from "../utils/context";
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
  newData: ResponseDatum[];
  sidMapping: Map<string, string>;
}

export default function PointsViewer({ newData, sidMapping }: IProps) {
  const positions = calcMappingCoordinates(newData);
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
        <OrbitControls />
        <GizmoHelper
          alignment="bottom-right" // widget alignment within scene
          margin={[80, 80]} // widget margins (X, Y)
          // onUpdate={/* called during camera animation  */}
          // onTarget={/* return current camera target (e.g. from orbit controls) to center animation */}
          // renderPriority={/* use renderPriority to prevent the helper from disappearing if there is another useFrame(..., 1)*/}
        >
          <GizmoViewport
            axisColors={["red", "green", "blue"]}
            labelColor="black"
          />
          {/* <GizmoViewcube /> */}
        </GizmoHelper>
        <Points limit={100000} range={positions.length}>
          <PointMaterial
            transparent={true}
            vertexColors={true}
            size={1}
            sizeAttenuation={true}
            depthWrite={false}
          />
          {positions.map((d, i) => {
            // console.log(d);
            return (
              <PointEvent
                key={i}
                position={[d.x, d.y, d.z]}
                data={d}
                sidMapping={sidMapping}
                setSidFunc={setCurrentTrackId}
              />
            );
          })}
        </Points>
      </Canvas>
      <SpotifyPlayer track_id={currentTrackId} />
    </>
  );
}

interface IPropsPointEvent {
  key: number;
  position: number[];
  data: ResponseDatum;
  sidMapping: Map<string, string>;
  setSidFunc: Dispatch<SetStateAction<string>>;
}

function PointEvent({
  position,
  data,
  sidMapping,
  setSidFunc,
}: IPropsPointEvent) {
  const [hovered, setHover] = useState(false);
  const [clicked, setClick] = useState(false);
  // artist: "Johann Walter"
  // sid: "5hdHbhjiLq5lmDqcuIKPU8"
  // title: "Nun bitten wir den heiligen Geist a 5"
  // x: 42.5323289925652
  // y: 40.28171529262906
  // year: 40.28171529262906
  // z: 80.27359674024238
  return (
    <>
      <Point
        color={clicked ? "hotpink" : hovered ? "yellow" : "darkgrey"}
        onPointerOver={(e: any) => (e.stopPropagation(), setHover(true))}
        onPointerOut={(e: any) => setHover(false)}
        onClick={(e: any) => {
          // setClick((state) => !state);
          setSidFunc(data.sid);
          e.stopPropagation();
        }}
        position={position}
      />
    </>
  );
}
