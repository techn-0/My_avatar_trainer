// background.js
import * as THREE from "three";

export function setSkyboxBackground(scene) {
  const loader = new THREE.TextureLoader();

  // 텍스처 로드
  loader.load(
    "/Stylized_Skybox_CitySkyLine_CubeMap_SHOWRE.png",
    (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping; // 반사 맵핑 설정
      scene.background = texture; // 배경으로 설정
    },
    undefined,
    (error) => {
      console.error("배경 텍스처를 로드하는 중 오류가 발생했습니다:", error);
    }
  );
}
