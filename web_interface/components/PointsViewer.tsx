import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { AxesHelper, Color, PerspectiveCamera, Vector3 } from "three";

import { Button, CardContent, Stack, Typography } from "@mui/material";
import * as Drei from "@react-three/drei";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  ArcballControls,
  Box,
  Circle,
  GizmoHelper, GizmoViewport,
  Instance,
  Instances,
  OrbitControls, RoundedBox, Sphere,
  Stats, Tetrahedron, Text,
  useBVH
} from "@react-three/drei";
import { Camera, Canvas, useThree } from "@react-three/fiber";

import CircleIcon from '@mui/icons-material/Circle';
import { ResponseDatum } from "../api/data";
import { calcMappingCoordinates } from "../utils/processData";
import { genreColorMap } from "../utils/songGenre";
import SpotifyPlayer from "./SpotifyPlayer";

const IS_DEVELOP_MODE = false;

declare global {
  interface Window {
    onSpotifyIframeApiReady: (IFrameAPI: any) => void;
    trustedTypes: any;
    SpotifyIframeConfig: any;
  }
}

interface IProps {
  newData: ResponseDatum[];
  colorBy: string; // genre | date | none 
}

export default function PointsViewer({ newData, colorBy }: IProps) {

  const positions = calcMappingCoordinates(newData);
  // console.log(positions);
  // states
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [currentTrackInfo, setcurrentTrackInfo] =
    useState<ResponseDatum>(undefined);
  const [currentTrackId, setCurrentTrackId] = useState("");

  // useEffect(() => {
  //   if (cameraRef && cameraRef.current) {
  //     cameraRef.current.fov = cameraState.fov;
  //   }
  // }, [cameraState]);

  return (
    <>
      <Button
        variant={isAutoRotating ? "contained" : "outlined"}
        size="small"
        style={{
          position: "absolute",
          top: "85px",
          right: "16px",
          fontSize: "12px",
          zIndex: "1000",
        }}
        onClick={() => setIsAutoRotating(!isAutoRotating)}
      >
        Auto Rotate {isAutoRotating ? "ON" : "OFF"}
      </Button>
      <Canvas
        resize={{ scroll: true, debounce: { scroll: 10, resize: 0 } }}
        raycaster={{ params: { Points: { threshold: 0.175 } } }}
        camera={{ position: [0, 0, 80] }}
        style={{
          width: "100%",
          height: "calc(100% - 100px)",
          backgroundColor: "#1e1e1e",
        }}
      // onPointerEnter={() => {
      //   setIsAutoRotating(false);
      // }}
      // onPointerLeave={() => {
      //   setIsAutoRotating(true);
      // }}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        {IS_DEVELOP_MODE && <Stats showPanel={0} className="stats" />}
        <OrbitControls
          enableDamping={false}
          maxZoom={200}
          minZoom={0.5}
          zoomSpeed={1}
          autoRotate={isAutoRotating}
          autoRotateSpeed={3}
        />
        <primitive object={new AxesHelper(100)} />
        <GizmoHelper
          alignment="bottom-right" // widget alignment within scene
          margin={[80, 80]} // widget margins (X, Y)
        >
          <GizmoViewport
            axisColors={["red", "green", "blue"]}
            labelColor="white"
          />
        </GizmoHelper>
        {positions.map((d, i) => {
          // console.log(d);
          return (
            <ClickableBox
              key={i}
              id={i}
              x={d.x}
              y={d.y}
              z={d.z}
              data={d}
              colorBy={colorBy}
              setTrackFunc={setcurrentTrackInfo}
              setSidFunc={setCurrentTrackId}
            />
          );
        })}
        {/* <Instances limit={100000} range={positions.length}>
          {positions.map((d, i) => {
            // console.log(d);
            return (
              <ClickableBoxForInstance
                key={i}
                id={i}
                x={d.x}
                y={d.y}
                z={d.z}
                data={d}
                setSidFunc={setCurrentTrackId}
              />
            );
          })}
        </Instances> */}
      </Canvas>
      <div
        style={{
          width: "100%",
          height: "80px",
          fontSize: 0,
          display: "flex",
          flexDirection: "row",
          backgroundColor: "rgb(18, 18, 18)",
        }}
      >
        <CardContent
          style={{
            width: "50%",
            height: "100%",
            padding: "8px 16px",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={1.5}
          >
            <Typography sx={{ fontSize: 12 }}>
              by {currentTrackInfo && currentTrackInfo.artist}
            </Typography>
            <Typography sx={{ fontSize: 12 }}>
              genre={currentTrackInfo && currentTrackInfo.genre}
            </Typography>
            {currentTrackInfo && <CircleIcon
              style={{
                width: "12px",
                color: genreColorMap.get(currentTrackInfo.genre)
              }} />}
          </Stack>
          <Typography
            variant="h5"
            component="div"
            noWrap  // truncate title with ellipsis
            style={{ lineHeight: "24px" }}
          >
            {currentTrackInfo && currentTrackInfo.title}
          </Typography>
          <Typography sx={{ fontSize: 12 }}>
            x=
            {currentTrackInfo
              ? Math.round(currentTrackInfo.x * 100) / 100
              : "N/A"}
            , y=
            {currentTrackInfo
              ? Math.round(currentTrackInfo.y * 100) / 100
              : "N/A"}
            , z=
            {currentTrackInfo
              ? Math.round(currentTrackInfo.z * 100) / 100
              : "N/A"}
          </Typography>
        </CardContent>
        <SpotifyPlayer track_id={currentTrackId} />
      </div>
    </>
  );
}

interface IPropsClickableBox {
  id: number;
  x: number;
  y: number;
  z: number;
  data: ResponseDatum;
  colorBy: string;
  setTrackFunc: Dispatch<SetStateAction<ResponseDatum>>;
  setSidFunc: Dispatch<SetStateAction<string>>;
}

/**
 * react-three-fiber component of each point (Sphere)
 */
const ClickableBox = ({
  x,
  y,
  z,
  data,
  colorBy,
  setTrackFunc,
  setSidFunc,
}: IPropsClickableBox) => {
  const [isHovered, setIsHovered] = useState(false);
  const useCircle = false;

  return (
    <>
      {useCircle ? (
        <Circle
          args={[1, 1]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setTrackFunc(data);
            setIsHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setIsHovered(false);
          }}
          position={new Vector3(x, y, z)}
          onClick={(e) => {
            e.stopPropagation();
            // console.log(data);
            setSidFunc(data.sid);
          }}
        />
      ) : (
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            setTrackFunc(data);
            setIsHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setIsHovered(false);
          }}
          position={new Vector3(x, y, z)}
          onClick={(e) => {
            e.stopPropagation();
            // console.log(data);
            setSidFunc(data.sid);
          }}
        >
          {data.artist == "USER" ?
            <Tetrahedron args={[0.5]}>
              <meshBasicMaterial
                color={"white"}
                fog={true}
                wireframe={false}
              // wireframeLinewidth={2}
              />
            </Tetrahedron>
            :
            <Sphere args={[0.5]}>
              <meshBasicMaterial
                color={isHovered ? "pink" : genreColorMap.get(data.genre)}
                fog={false}
                wireframe={true}
                wireframeLinewidth={2}
              />
            </Sphere>
          }
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

const ClickableBoxForInstance = ({
  id,
  x,
  y,
  z,
  data,
  setSidFunc,
}: IPropsClickableBox) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <Instance
        scale={2}
        onPointerOver={(e) => {
          e.stopPropagation();
          // console.log(data);
          setIsHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsHovered(false);
        }}
        position={new Vector3(x, y, z)}
        onClick={(e) => {
          e.stopPropagation();
          // console.log(data);
          setSidFunc(data.sid);
        }}
      />
      <meshStandardMaterial color={isHovered ? "red" : "orange"} />
      <sphereGeometry id={id} args={[0.25]} />
    </>
  );
};
