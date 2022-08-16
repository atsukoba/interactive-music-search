// @ts-nocheck

import {
  Dispatch,
  SetStateAction,
  useState,
  useRef,
  ForwardRefExoticComponent,
  useEffect,
} from "react";
import { MathUtils } from "three";

import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  OrbitControlsProps,
  Point,
  PointMaterial,
  Points,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";

import { ResponseDatum } from "../api/data";
import { calcMappingCoordinates } from "../utils/context";
import SpotifyPlayer from "./SpotifyPlayer";
import { useFrame } from "@react-three/fiber";

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

const AutoOrbitControls = (props) => {
  const { gl, camera } = useThree();
  const controls = useRef<OrbitControlsProps>();

  useFrame(() => {
    if (controls.current.camera) {
      controls.current.camera.rotation.y += 0.01;
    }
  });

  useEffect(() => {
    controls.current.enabled = false;
    camera.updateProjectionMatrix();
    controls.current.enabled = true;
    controls.current.update();
  }, []);

  return (
    <OrbitControls
      ref={controls}
      args={[camera, gl.domElement]}
      enableDamping={false}
      {...props}
    />
  );
};

export default function PointsViewer({ newData, sidMapping }: IProps) {
  const positions = calcMappingCoordinates(newData);
  console.log(positions);
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
        camera={{ position: [0, 0, 70] }}
        style={{
          width: "100%",
          height: "calc(100% - 100px)",
          backgroundColor: "#f7f7f7",
        }}
      >
        <OrbitControls enableDamping={false} />
        <GizmoHelper
          alignment="bottom-right" // widget alignment within scene
          margin={[80, 80]} // widget margins (X, Y)
        >
          <GizmoViewport
            axisColors={["red", "green", "blue"]}
            labelColor="black"
          />
        </GizmoHelper>
        <Points
          limit={100000}
          range={positions.length}
          // matrixAutoUpdate={true}
        >
          <PointMaterial
            transparent={true}
            vertexColors={false}
            size={0.5}
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
  setSidFunc: Dispatch<SetStateAction<string>>;
}

function PointEvent({ position, data, setSidFunc }: IPropsPointEvent) {
  
  // const [hovered, setHover] = useState(false);
  // const [clicked, setClick] = useState(false);
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
        // color={clicked ? "red" : hovered ? "pink" : "black"}
        color={"black"}
        position={position}
        // onPointerOver={(e: any) => (e.stopPropagation(), setHover(true))}
        // onPointerOut={(e: any) => setHover(false)}
        onClick={(e: any) => {
          console.log(e);
          e.stopPropagation();
          setSidFunc(data.sid);
          // setClick((state) => !state);
        }}
      />
    </>
  );
}
