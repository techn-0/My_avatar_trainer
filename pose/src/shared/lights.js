import * as THREE from "three";

// 조명 추가 함수
export function addLights(scene) {
  // 환경광 추가
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  // 방향성 조명 추가
  const directionalLight = new THREE.DirectionalLight(0xffffff, 6);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true; // 그림자 캐스팅 활성화

  // 그림자 카메라의 범위 조정
  directionalLight.shadow.camera.left = -100;
  directionalLight.shadow.camera.right = 100;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 500;

  // 그림자 해상도 설정
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;

  // 씬에 조명 추가
  scene.add(directionalLight);
}
