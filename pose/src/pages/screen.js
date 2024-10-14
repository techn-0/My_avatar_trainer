import * as THREE from "three";
import { WEBGL } from "../webgl";
import { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function ThreeScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (WEBGL.isWebGLAvailable()) {
      // orbit 확인
      console.log(OrbitControls);

      // 장면
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("white");

      // 카메라
      // 게임에 자주 나오는 그거
      const fov = 70;
      // 종횡비
      const aspect = window.innerWidth / window.innerHeight;
      // 카메라의 시점이 시작되는 위치 - 이것보다 가까우면 렌더링 안됨.
      const near = 0.1;
      // 카메라의 시점이 끝나는 위치 - 이것보다 멀면 렌더링 안됨.
      const far = 1000;
      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.set(0, 1.5, 3); // 순서대로 좌우, 상하, 앞뒤
      // 카메라가 어디에 있던, 해당 위치를 바라보게 함.
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      // 랜더러 - 지글거림을 해결하기 위해 안티얼라이싱 사용.
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);

      // OrbitControls 추가 -> 카메라 설정 이후에 해줘야 함.
      const controls = new OrbitControls(camera, renderer.domElement);
      // 줌인 최소값
      controls.minDistance = 2;
      // 줌인 최대값
      controls.maxDistance = 6;
      // 최대 각도 지정
      controls.maxPolarAngle = Math.PI / 2;
      // 최소 각도 지정 -> minPolarAngle
      controls.update();

      // 빛 추가
      const pointLight = new THREE.PointLight(0xffffff, 11);
      pointLight.position.set(0, 2, 0);
      scene.add(pointLight);

      mountRef.current.appendChild(renderer.domElement);

      // 매쉬
      const geometry01 = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const material01 = new THREE.MeshStandardMaterial({
        color: 0xff7f00,
      });
      const obj01 = new THREE.Mesh(geometry01, material01);
      obj01.position.x = -1;
      scene.add(obj01);

      const geometry02 = new THREE.TorusGeometry(0.3, 0.15, 16, 40);
      const material02 = new THREE.MeshPhongMaterial({
        shininess: 300,
        color: 0xff7f00,
      });
      const obj02 = new THREE.Mesh(geometry02, material02);
      scene.add(obj02);

      const geometry03 = new THREE.IcosahedronGeometry(0.3, 0);
      const material03 = new THREE.MeshLambertMaterial({
        color: 0xff7f00,
      });
      const obj03 = new THREE.Mesh(geometry03, material03);
      obj03.position.x = 1;
      scene.add(obj03);

      // 바닥 추가
      const planeGeometry = new THREE.PlaneGeometry(30, 30, 1, 1);
      const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xaeeeee });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = -0.5 * Math.PI;
      plane.position.y = -0.5;
      scene.add(plane);

      // Orbit Controls 해서 주석처리. orbit안쓸거면 이거 쓰면 될듯
      //   function render(time) {
      //     time *= 0.0005;

      //     // obj01.rotation.x = time;
      //     obj01.rotation.y = time;

      //     // obj02.rotation.x = time;
      //     obj02.rotation.y = time;

      //     // obj03.rotation.x = time;
      //     obj03.rotation.y = time;

      //     renderer.render(scene, camera);
      //     requestAnimationFrame(render);
      //   }

      //   requestAnimationFrame(render);
      function animate() {
        requestAnimationFrame(animate);
        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
      return () => {
        // 정리 작업
        mountRef.current.removeChild(renderer.domElement);
      };

      // 반응형 처리 함수
      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      // 함수를 이벤트리스너에 추가, resize가(윈도우가) 될때마다 실행시켜라.
      window.addEventListener("resize", onWindowResize);
    } else {
      const warning = WEBGL.getWebGLErrorMessage();
      mountRef.current.appendChild(warning);
    }
  }, []);

  return <div ref={mountRef}></div>;
}

export default ThreeScene;
