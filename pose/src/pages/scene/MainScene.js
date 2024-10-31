import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { WEBGL } from "../../webgl";
import { useNavigate } from "react-router-dom";
import Buttons from "../ui/mainButtons";
import { loadCharacter } from "../../shared/loadCharacter";
import { addLights } from "../../shared/lights";
import { createPlane } from "../../app/createPlane";
import { initOrbitControls } from "../../shared/initOrbitControls";
import LoginModal from "../login/LoginModal"; // Import the new component
import MyPage from "../MyPage/MyPage";
import { setSkyboxBackground } from "../../shared/background";
import { getToken } from "../login/AuthContext";
import "./MainScene.css";

function ThreeScene() {
  const mountRef = useRef(null);
  const [openLogin, setOpenLogin] = useState(false);
  const [userId, setUserId] = useState(null); // userId
  const cameraRef = useRef();
  const controlsRef = useRef();
  const mixerRef = useRef();
  const modelRef = useRef();
  const loadedAnimations = useRef();
  const sceneRef = useRef();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const navigate = useNavigate();
  useEffect(() => {
    // 페이지가 로드될 때 세션 스토리지에서 userId를 가져옴
    const storedUserId = sessionStorage.getItem("userId");
    setUserId(storedUserId);

    if (getToken()) {
      console.log("token exists");
    } else {
      console.log("token does not exists");
    }
  }, []);

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
      camera.rotation.set(0, 0, 0);
      camera.position.set(0, 1, 0);
      cameraRef.current = camera;
      scene.add(camera);

      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // const controls = initOrbitControls(camera, renderer);
      // controlsRef.current = controls;

      addLights(scene);

      // background
      setSkyboxBackground(scene);

      const plane = createPlane();
      scene.add(plane);

      loadCharacter(scene, (loadedMixer, loadedModel, animations) => {
        mixerRef.current = loadedMixer;
        modelRef.current = loadedModel;
        loadedModel.position.x = -1.4;
        loadedModel.position.y = 0;
        loadedModel.position.z = -3;
        loadedModel.rotation.y = THREE.MathUtils.degToRad(20);
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
    // 로그인 후 userId 갱신
    const storedUserId = sessionStorage.getItem("userId");
    setUserId(storedUserId);
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
        <div className="btn_box">
          <Buttons
            onMainPageClick={() => navigate("/")}
            onLoginPageClick={openLoginDialog}
            onLogout={() => setUserId(null)} // 로그아웃 시 userId를 null로 설정
          />
        </div>
      </div>
      {/* 우측 상단에 userId 표시 */}
      <div className="welcome btn_box">
        {userId && (
          <div className="welcome_text">
            안녕하세요 <br />
            <span className="name">{userId}</span>님
          </div>
        )}
      </div>

      {/* Use the new LoginModal component */}
      <LoginModal open={openLogin} onClose={closeLoginDialog} />
    </div>
  );
}

export default ThreeScene;
