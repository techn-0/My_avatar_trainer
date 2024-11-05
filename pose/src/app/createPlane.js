import * as THREE from "three";

export function createPlane() {
  const planeGeometry = new THREE.PlaneGeometry(30, 20, 1, 1);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: "#948EB9" });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.y = 0;
  plane.receiveShadow = true; // 바닥이 그림자를 받도록 설정
  return plane;
}
