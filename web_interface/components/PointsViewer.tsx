import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  Clock,
  Color,
  Mesh,
  MeshNormalMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  PointLight,
  Raycaster,
  Scene,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ResponseDatum } from "../api/data";
import { calcMappingCoordinates } from "../utils/context";
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
  const positions = calcMappingCoordinates(newData, 10);
  console.log("Positions:", positions);

  const [currentTrackId, setCurrentTrackId] = useState("");

  let canvasElement: HTMLElement;

  // useEffect(() => {
  //   if (canvas) return;
  //   const scene = new Scene();
  //   scene.background = new Color(0xf7f7f7);

  //   canvas = document.querySelector("#canvas3d")!;

  //   // let axes = new AxesHelper(25);
  //   // scene.add(axes);

  //   const sizes = {
  //     width: canvas.getBoundingClientRect().width,
  //     height: canvas.getBoundingClientRect().height,
  //   };

  //   const renderer = new WebGLRenderer({
  //     canvas: canvas,
  //     // antialias: true,
  //     // alpha: true,
  //   });
  //   renderer.setSize(sizes.width, sizes.height);
  //   // renderer.setPixelRatio(window.devicePixelRatio);

  //   const camera = new PerspectiveCamera(
  //     75,
  //     sizes.width / sizes.height,
  //     1,
  //     1000
  //   );
  //   camera.position.set(0, 0, 0);

  //   const controls = new OrbitControls(camera, canvas);
  //   controls.autoRotate = true;
  //   controls.enabled = true;

  //   const SIZE = 1000;
  //   const LENGTH = 100;
  //   const vertices: number[][] = [];
  //   for (let i = 0; i < LENGTH; i++) {
  //     const x = SIZE * (Math.random() - 0.5);
  //     const y = SIZE * (Math.random() - 0.5);
  //     const z = SIZE * (Math.random() - 0.5);
  //     vertices.push([x, y, z]);
  //   }
  //   const objects: Mesh<SphereGeometry, MeshPhongMaterial>[] = [];
  //   vertices.forEach((d) => {
  //     const geometry = new SphereGeometry(5, 10, 10);
  //     const material = new MeshPhongMaterial({ color: 0x0f0f0f });
  //     const sphere = new Mesh(geometry, material);
  //     sphere.position.set(d[0], d[1], d[2]);
  //     scene.add(sphere);
  //     objects.push(sphere);
  //   });

  //   // const ambientLight = new AmbientLight(0xffffff, 0.7);
  //   // scene.add(ambientLight);
  //   // const pointLight = new PointLight(0xffffff, 0.2);
  //   // pointLight.position.set(0, 0, 50);
  //   // scene.add(pointLight);

  //   animate();
  //   function animate() {
  //     // required if controls.enableDamping or controls.autoRotate are set to true
  //     // controls.update();
  //     renderer.render(scene, camera);
  //     requestAnimationFrame(animate);
  //   }

  //   // const clock = new Clock();
  //   // const tick = () => {
  //   //   const elapsedTime = clock.getElapsedTime();
  //   //   camera.rotation.x = elapsedTime / 10;
  //   //   camera.rotation.y = elapsedTime / 10;
  //   //   window.requestAnimationFrame(tick);
  //   //   console.log("camera position", camera.position, camera.rotation);
  //   //   renderer.render(scene, camera);
  //   // };
  //   // tick();

  //   window.addEventListener("resize", () => {
  //     sizes.width = canvas.getBoundingClientRect().width;
  //     sizes.height = canvas.getBoundingClientRect().height;
  //     camera.aspect = sizes.width / sizes.height;
  //     camera.updateProjectionMatrix();
  //     renderer.setSize(sizes.width, sizes.height);
  //     renderer.setPixelRatio(window.devicePixelRatio);
  //     controls.update();
  //   });

  //   //   let mouse = new Vector2(0, 0);
  //   //   let raygun = new Raycaster();
  //   //   let useRaycast = true;

  //   //   // Raycast when we click the mouse
  //   //   function onClick(event: MouseEvent) {
  //   //     // Get mouse position in screen space
  //   //     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  //   //     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  //   //     // Only raycast if not panning (optimization)
  //   //     let hits;
  //   //     if (useRaycast) {
  //   //       raygun.setFromCamera(mouse, camera);
  //   //       // Raycast to single object
  //   //       hits = raygun.intersectObject(objects as any, false);
  //   //       // Raycast to multiple objects
  //   //       // hits = raygun.intersectObjects([myTargetObect, myTargetObect2]);
  //   //     }
  //   //     // Run if we have intersections
  //   //     if (hits.length > 0) {
  //   //       for (let i = 0; i < hits.length; i++) {
  //   //         // Change material color of item we clicked on
  //   //         hits[i].object.material.color.set(0xff0000);
  //   //       }
  //   //       renderer.render(scene, camera);
  //   //     }
  //   //   }
  //   //   window.addEventListener("click", onClick, false);
  // }, []);

  useEffect(() => {
    if (canvasElement) {
      return;
    }

    canvasElement = document.querySelector("#canvas3d");
    const renderer = new WebGLRenderer({
      canvas: canvasElement,
    });
    const width = canvasElement.getBoundingClientRect().width;
    const height = canvasElement.getBoundingClientRect().height;
    renderer.setSize(width, height);

    const scene = new Scene();

    let axes = new AxesHelper(25);
    scene.add(axes);

    const camera = new PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(0, 0, 1000);

    const controls = new OrbitControls(camera, canvasElement);

    // const SIZE = 1000;
    // const LENGTH = 2000;
    // const vertices: number[][] = [];
    // for (let i = 0; i < LENGTH; i++) {
    //   const x = SIZE * (Math.random() - 0.5);
    //   const y = SIZE * (Math.random() - 0.5);
    //   const z = SIZE * (Math.random() - 0.5);
    //   vertices.push([x, y, z]);
    // }
    // const objects: Mesh<SphereGeometry, MeshPhongMaterial>[] = [];
    positions.forEach((d) => {
      const mesh = new Mesh(new BoxGeometry(5, 5, 5), new MeshNormalMaterial());
      scene.add(mesh);
      mesh.position.set(d.x, d.y, d.z);
      scene.add(mesh);
      // objects.push(sphere);
    });

    tick();

    // 毎フレーム時に実行されるループイベントです
    function tick() {
      // レンダリング
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
  }, [positions]);

  return (
    <>
      <canvas
        id="canvas3d"
        style={{
          width: "100%",
          height: "calc(100% - 100px)",
        }}
      />
      <SpotifyPlayer track_id={currentTrackId} />
    </>
  );
}
