// @ts-nocheck

import {
  Dispatch,
  SetStateAction,
  useState,
  useRef,
  ForwardRefExoticComponent,
  useEffect,
} from "react";
import { MathUtils, Vector3 } from "three";

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
        <OrbitControls
          enableDamping={false}
          zoomSpeed={1}
          autoRotate={true}
          autoRotateSpeed={10}
        />
        <GizmoHelper
          alignment="bottom-right" // widget alignment within scene
          margin={[80, 80]} // widget margins (X, Y)
        >
          <GizmoViewport
            axisColors={["red", "green", "blue"]}
            labelColor="black"
          />
        </GizmoHelper>
        {positions.map((d, i) => {
          // console.log(d);
          return (
            <CliclableBox
              key={i}
              x={d.x}
              y={d.y}
              z={d.z}
              data={d}
              setSidFunc={setCurrentTrackId}
            />
          );
        })}
      </Canvas>
      <SpotifyPlayer track_id={currentTrackId} />
    </>
  );
}

interface IPropsClickableBox {
  x: number;
  y: number;
  z: number;
  data: ResponseDatum;
  setSidFunc: Dispatch<SetStateAction<string>>;
}

const CliclableBox = ({ x, y, z, data, setSidFunc }: IPropsClickableBox) => {
  // const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  // useFrame(() => {
  //   ref.current.rotation.x += 0.01;
  //   ref.current.rotation.y += 0.01;
  // }, []);
  return (
    <mesh
      // ref={ref}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      position={new Vector3(x, y, z)}
      onClick={(e) => {
        e.stopPropagation();
        setSidFunc(data.sid);
      }}
    >
      <boxBufferGeometry />
      <meshLambertMaterial color={isHovered ? 0x44c2b5 : 0x9178e6} />
    </mesh>
  );
};
