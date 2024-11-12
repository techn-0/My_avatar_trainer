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
import PendingRequests from "../MyPage/pendingRequests";
import { jwtDecode } from "jwt-decode";

// 로컬 ec2 주소 전환용
const apiUrl = process.env.REACT_APP_API_BASE_URL; //백 요청
const frontendUrl = process.env.REACT_APP_FRONTEND_BASE_URL; // 프론트 리다이렉트

const imageNames = ["t1.png", "t2.png", "t3.png", "t4.png", "t5.png"];
const preloadImages = imageNames.map((name) => {
  const img = new Image();
  img.src = `${process.env.PUBLIC_URL}/tier/${name}`;
  return img;
});

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
  const token = getToken();
  const [tier, setTier] = useState("");
  const [pendingRequest, setPendingRequest] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // 토큰을 디코딩하여 userId 추출
        setUserId(decodedToken.id);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [token]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`${apiUrl}/friends/pendingRequestList`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // JWT 토큰 추가
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userId }),
        });
        const data = await response.json();
        console.log("pending requests: ", data);
        setPendingRequest(data); // 전체 요청 배열로 설정
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };
    fetchRequests();

    if (getToken()) {
      console.log("token exists");
    } else {
      console.log("token does not exists");
    }

    //////////////////////// 티어 구현 /////////////////////////////////////////////////

    const fetchTier = async () => {
      try {
        const response = await fetch(`${apiUrl}/tier`, {
          method: "POST", // GET에서 POST로 변경
          headers: {
            Authorization: `Bearer ${token}`, // JWT 토큰 추가
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userId }), // 필요한 데이터가 있다면 body에 포함
        });
        const data = await response.json();
        setTier(data.tier);
        console.log("your tier: ", data.tier);
      } catch (error) {
        console.error("Error fetching tier data:", error);
      }
    };

    fetchTier();
  }, [userId, token]);

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
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.userId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
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
  const handleRequestUpdate = (friendUserId) => {
    setPendingRequest((prevRequests) =>
      prevRequests.filter((request) => request.userId !== friendUserId)
    );
  };

  return (
    <div ref={mountRef} style={{ position: "relative" }}>
      <div>
        {userId && pendingRequest.length > 0 && (
          <PendingRequests
            pendingRequests={pendingRequest} // Updated here
            onRequestUpdate={handleRequestUpdate} // 추가된 핸들러
          />
        )}
      </div>
      <div
        style={{ position: "absolute", top: "20px", left: "20px", zIndex: 1 }}
      >
        <div className="btn_box btn_box_cont">
          <Buttons
            onMainPageClick={() => navigate("/")}
            onLoginPageClick={openLoginDialog}
            onLogout={() => setUserId(null)} // 로그아웃 시 userId를 null로 설정
          />
        </div>
      </div>
      {/* 우측 상단에 userId 표시 */}

      <div className="welcome btn_box">
        {tier >= 1 && tier <= 5 && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              style={{ width: "100px" }}
              src={preloadImages[tier - 1].src}
              className="tier-image"
            />
          </div>
        )}
        {userId && (
          <div className="welcome_text">
            <span className="name">{userId}</span>
          </div>
        )}
      </div>

      {/* Use the new LoginModal component */}
      <LoginModal open={openLogin} onClose={closeLoginDialog} />
    </div>
  );
}

export default ThreeScene;
