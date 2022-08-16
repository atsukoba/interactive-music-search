import {
  Dispatch,
  ForwardRefExoticComponent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

import { ResponseDatum } from "../api/data";
import { calcMappingCoordinates } from "../utils/context";
import { useGetElementProperty } from "../utils/ref";
import SpotifyPlayer from "./SpotifyPlayer";

declare global {
  interface Window {
    onSpotifyIframeApiReady: (IFrameAPI: any) => void;
    trustedTypes: any;
    SpotifyIframeConfig: any;
  }
}

interface IProps {
  newData: ResponseDatum[];
}

export default function PointsViewer({ newData }: IProps) {
  const positions = calcMappingCoordinates(newData);
  const targetRef = useRef(null);
  const { getElementProperty } =
    useGetElementProperty<HTMLCanvasElement>(targetRef);
  console.log(positions);
  // states
  const [currentTrackId, setCurrentTrackId] = useState("");

  let canvas: HTMLElement;
  console.log(THREE);
  useEffect(() => {
    if (canvas) return;
    // canvasを取得
    canvas = document.getElementById("canvas3d")!;

    // シーン
    const scene = new THREE.Scene();

    // サイズ
    const sizes = {
      width: canvas.getBoundingClientRect().width,
      height: canvas.getBoundingClientRect().height
    };

    // カメラ
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      1000
    );

    // レンダラー
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas || undefined,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);

    // ボックスジオメトリー
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshLambertMaterial({
      color: "#2497f0",
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.z = -5;
    box.rotation.set(10, 10, 10);
    scene.add(box);

    // ライト
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.2);
    pointLight.position.set(1, 2, 3);
    scene.add(pointLight);

    // アニメーション
    const clock = new THREE.Clock();
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      box.rotation.x = elapsedTime;
      box.rotation.y = elapsedTime;
      window.requestAnimationFrame(tick);
      renderer.render(scene, camera);
    };
    tick();

    window.addEventListener("resize", () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(window.devicePixelRatio);
    });
  }, []);

  return (
    <>
      <canvas
        id="canvas3d"
        ref={targetRef}
        style={{
          width: "100%",
          height: "calc(100% - 100px)",
          backgroundColor: "#f7f7f7",
        }}
      />
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
