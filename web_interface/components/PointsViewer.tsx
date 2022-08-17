import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { AxesHelper, Color, Vector3 } from "three";

import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  RoundedBox,
  Stats,
  Text,
  Circle,
  Sphere,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";

import { ResponseDatum } from "../api/data";
import { calcMappingCoordinates } from "../utils/context";
import SpotifyPlayer from "./SpotifyPlayer";

const IS_DEVELOP_MODE = true;

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

const redColor = new Color(0xff0000);
const blueColor = new Color(0x0000ff);

export default function PointsViewer({ newData, sidMapping }: IProps) {
  const positions = calcMappingCoordinates(newData);
  console.log(positions);
  // states
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState("");

  return (
    <>
      <Canvas
        resize={{ scroll: true, debounce: { scroll: 10, resize: 0 } }}
        raycaster={{ params: { Points: { threshold: 0.175 } } }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 80] }}
        style={{
          width: "100%",
          height: "calc(100% - 100px)",
          backgroundColor: "#f7f7f7",
        }}
        onPointerEnter={() => {
          setIsAutoRotating(false);
        }}
        onPointerLeave={() => {
          setIsAutoRotating(true);
        }}
      >
        {IS_DEVELOP_MODE && <Stats showPanel={0} className="stats" />}
        <OrbitControls
          enableDamping={false}
          maxZoom={100}
          minZoom={0.8}
          zoomSpeed={1}
          autoRotate={isAutoRotating}
          autoRotateSpeed={5}
        />
        <primitive object={new AxesHelper(100)} />
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
        s
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
  // }, []);\

  const useCircle = false;

  return (
    <>
      {useCircle ? (
        <Circle
          args={[1, 1]}
          onPointerOver={(e) => {
            e.stopPropagation();
            console.log(data);
            setIsHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setIsHovered(false);
          }}
          position={new Vector3(x, y, z)}
          onClick={(e) => {
            e.stopPropagation();
            console.log(data);
            setSidFunc(data.sid);
          }}
        />
      ) : (
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            console.log(data);
            setIsHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setIsHovered(false);
          }}
          position={new Vector3(x, y, z)}
          onClick={(e) => {
            e.stopPropagation();
            console.log(data);
            setSidFunc(data.sid);
          }}
        >
          <Sphere args={[0.25]}>
            <meshBasicMaterial color={isHovered ? "red" : "orange"} />
          </Sphere>
          {/* <RoundedBox args={[0.5, 0.5, 0.5]} radius={0.05}></RoundedBox> */}
        </mesh>
      )}
      {isHovered && (
        <Text
          color="black"
          anchorX="center"
          anchorY="middle"
          position={new Vector3(x, y + 0.05, z)}
        >
          {data.title} / {data.artist}
        </Text>
      )}
    </>
  );
};
