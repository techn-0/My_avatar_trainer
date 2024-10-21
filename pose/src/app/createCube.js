import * as THREE from "three";

export function createCube(canvas1, canvas2) {
  const cubeGeometry = new THREE.BoxGeometry(1, 4, 4);

  // Mediapipe가 그려진 캔버스를 텍스처로 변환
  const canvasTexture1 = new THREE.CanvasTexture(canvas1); // 캔버스 1 텍스처
  const canvasTexture2 = new THREE.CanvasTexture(canvas2); // 캔버스 2 텍스처

  // 6면의 텍스처를 정의, 두 면에 Mediapipe 결과 표시
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xff0000 }), // 면 1
    new THREE.MeshBasicMaterial({ map: canvasTexture1 }), // 면 3: Mediapipe 캔버스
    new THREE.MeshStandardMaterial({ color: 0xff0000 }), // 면 2
    new THREE.MeshBasicMaterial({ map: canvasTexture2 }), // 면 4: Mediapipe 캔버스
    new THREE.MeshStandardMaterial({ color: 0xff0000 }), // 면 5
    new THREE.MeshStandardMaterial({ color: 0xff0000 }), // 면 6
  ];

  const cube = new THREE.Mesh(cubeGeometry, materials);
  cube.position.set(4, 2, 0);
  cube.castShadow = true;
  cube.receiveShadow = true;

  // 텍스처의 업데이트를 위한 함수
  cube.updateTextures = () => {
    canvasTexture1.needsUpdate = true; // 텍스처를 업데이트하도록 설정
    canvasTexture2.needsUpdate = true;
  };

  return cube;
}
