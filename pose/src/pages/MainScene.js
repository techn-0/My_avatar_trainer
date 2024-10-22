import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { WEBGL } from "../webgl";
import { useNavigate } from "react-router-dom";
import Buttons from "./ui/mainButtons";
import { loadCharacter } from "../shared/loadCharacter";
import { addLights } from "../shared/lights";
import { createPlane } from "../app/createPlane";
import { initOrbitControls } from "../shared/initOrbitControls";
import LoginModal from "./login/LoginModal"; // Import the new component
import ExerciseGraph from "./ExerciseGraph/ExerciseGraph";
import { setBackgroundColor } from "../shared/background";
import { getToken } from "./login/AuthContext"; // 토큰

function ThreeScene() {
  const mountRef = useRef(null);
  const [openLogin, setOpenLogin] = useState(false);
  const cameraRef = useRef();
  const controlsRef = useRef();
  const mixerRef = useRef();
  const modelRef = useRef();
  const loadedAnimations = useRef();
  const sceneRef = useRef();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const navigate = useNavigate();
  if (getToken()) {
    console.log("token exists");
  } else {
    console.log("token does not exists");
  }

  useEffect(() => {
    // Three.js scene setup
    if (WEBGL.isWebGLAvailable()) {
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        4000
      );
      camera.position.set(0, 2, 4);
      cameraRef.current = camera;
      scene.add(camera);

      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const controls = initOrbitControls(camera, renderer);
      controlsRef.current = controls;

      addLights(scene);

      // background
      setBackgroundColor(scene);

      const plane = createPlane();
      scene.add(plane);

      loadCharacter(scene, (loadedMixer, loadedModel, animations) => {
        mixerRef.current = loadedMixer;
        modelRef.current = loadedModel;
        loadedAnimations.current = animations;
      });

      const clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        if (mixerRef.current) {
          mixerRef.current.update(delta);
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

      // Append renderer's DOM element to mountRef
      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      // Cleanup function
      return () => {
        // Check if mountRef.current is not null before calling removeChild
        if (mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
        window.removeEventListener("resize", onWindowResize);
      };
    }
  }, []);

  const openLoginDialog = () => {
    setOpenLogin(true);
  };

  const closeLoginDialog = () => {
    setOpenLogin(false);
  };

  // Add the click event listener
  useEffect(() => {
    function onClick(event) {
      // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the raycaster with the camera and mouse position
      raycaster.current.setFromCamera(mouse.current, cameraRef.current);

      // Calculate objects intersecting the raycaster
      const intersects = raycaster.current.intersectObjects(
        sceneRef.current.children,
        true
      );

      if (intersects.length > 0) {
        const intersection = intersects[0];
        console.log("Clicked coordinates:", intersection.point);
      }
    }

    // Add the event listener to the DOM element
    window.addEventListener("click", onClick);

    return () => {
      // Remove the event listener when the component unmounts
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div ref={mountRef} style={{ position: "relative" }}>
      <div
        style={{ position: "absolute", top: "20px", left: "20px", zIndex: 1 }}
      >
        <Buttons
          onMainPageClick={() => navigate("/")}
          onLoginPageClick={openLoginDialog}
        />
      </div>

      {/* Use the new LoginModal component */}
      <LoginModal open={openLogin} onClose={closeLoginDialog} />
    </div>
  );
}

export default ThreeScene;
