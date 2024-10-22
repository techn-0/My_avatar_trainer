// background.js
import * as THREE from "three";

export function setBackgroundColor(scene) {
  const color = 0xa67cde; // Hex color for #A67CDE
  scene.background = new THREE.Color(color);
}
