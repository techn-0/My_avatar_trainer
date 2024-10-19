import * as THREE from "three";
import { WEBGL } from "../webgl";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Buttons from "./buttons";
import { animateCameraMove } from "./cameraMove";
import { loadCharacter } from "./loadCharacter";
import { addLights } from "./lights";
import { createPlane } from "./createPlane";
import { createCube } from "./createCube";
import { initOrbitControls } from "./initOrbitControls";
import MediapipeMotionTracking from "./cam";

function ThreeScene() {
  const mountRef = useRef(null);
  const [canvas1, setCanvas1] = useState(null);
  const [canvas2, setCanvas2] = useState(null);
  const navigate = useNavigate();
  let camera;
  let controls;
  let mixer;
  let model;
  let cube = null; // 큐브를 null로 초기화
  let raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();
  let loadedAnimations;
  let scene;

  const handleCanvasUpdate = (canvas1, canvas2) => {
    setCanvas1(canvas1);
    setCanvas2(canvas2);
  };

  useEffect(() => {
    if (WEBGL.isWebGLAvailable()) {
      scene = new THREE.Scene();
      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);

      const fov = 60;
      const aspect = window.innerWidth / window.innerHeight;
      const near = 1;
      const far = 4000;

      camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.set(0, 2, 4);

      scene.add(camera);
      camera.rotation.x = 10;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      controls = initOrbitControls(camera, renderer);

      addLights(scene);

      const plane = createPlane();
      scene.add(plane);

      loadCharacter(scene, function (loadedMixer, loadedModel, animations) {
        mixer = loadedMixer;
        model = loadedModel;
        loadedAnimations = animations;

        if (animations && animations.length > 0) {
          console.log("Animations loaded:", animations);
        } else {
          console.error("No animations available.");
        }
      });

      window.addEventListener("click", onMouseClick);

      let clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        if (mixer) {
          mixer.update(delta);
        }

        // 큐브가 존재하고, 텍스처 업데이트 함수가 있다면 업데이트
        if (cube && cube.updateTextures) {
          cube.updateTextures();
        }

        renderer.render(scene, camera);
      }

      animate();

      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener("resize", onWindowResize);

      mountRef.current.appendChild(renderer.domElement);

      return () => {
        mountRef.current.removeChild(renderer.domElement);
        window.removeEventListener("click", onMouseClick);
      };
    } else {
      const warning = WEBGL.getWebGLErrorMessage();
      mountRef.current.appendChild(warning);
    }
  }, [canvas1, canvas2]);

  const onMouseClick = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      console.log(
        `Clicked coordinates: x=${point.x}, y=${point.y}, z=${point.z}`
      );
    }
  };

  const playIdleAnimation = () => {
    if (mixer && loadedAnimations && loadedAnimations.length > 1) {
      mixer.stopAllAction();
      const action = mixer.clipAction(loadedAnimations[1]);
      action.reset().fadeIn(0.5).play();
    }
  };

  const playRunAnimation = () => {
    if (mixer && loadedAnimations && loadedAnimations.length > 4) {
      mixer.stopAllAction();
      const action = mixer.clipAction(loadedAnimations[4]);
      action.reset().fadeIn(0.5).play();
    }
  };

  const moveCameraToLoginPage = () => {
    // animateCameraMove(camera, controls, { x: 500, y: 20, z: 500 });
    navigate("/login");
  };

  const moveCameraToExercise = () => {
    animateCameraMove(camera, controls, { x: 0, y: 2, z: 430 });

    // 큐브가 아직 생성되지 않았을 때만 생성
    if (!cube && canvas1 && canvas2) {
      cube = createCube(canvas1, canvas2);
      scene.add(cube);
    }
  };

  const moveCameraToResult = () => {
    animateCameraMove(camera, controls, { x: 500, y: 0, z: -500 });
  };

  const moveCameraToMainPage = () => {
    animateCameraMove(camera, controls, { x: 0, y: 2, z: 4 });
  };

  return (
    <div ref={mountRef} style={{ position: "relative" }}>
      <MediapipeMotionTracking onCanvasUpdate={handleCanvasUpdate} />
      <div
        style={{ position: "absolute", top: "20px", left: "20px", zIndex: 1 }}
      >
        <Buttons
          onMainPageClick={moveCameraToMainPage}
          onLoginPageClick={moveCameraToLoginPage}
          onExerciseClick={moveCameraToExercise}
          onResultClick={moveCameraToResult}
          onPlayIdleClick={playIdleAnimation}
          onPlayRunClick={playRunAnimation}
        />
      </div>
    </div>
  );
}

export default ThreeScene;
