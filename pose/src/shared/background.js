// background.js
import * as THREE from "three";

export function setSkyboxBackground(scene) {
  const loader = new THREE.TextureLoader();

  // 텍스처 로드
  loader.load(
    "/Stylized_Skybox_CitySkyLine_CubeMap_SHOWRE.png",
    (texture) => {
      // 텍스처 맵핑 설정
      texture.mapping = THREE.EquirectangularReflectionMapping;

      // 스카이박스 지오메트리 생성 (박스 또는 구)
      const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000); // 크기는 필요에 따라 조정
      // 또는 SphereGeometry를 사용할 수 있습니다.
      // const skyboxGeometry = new THREE.SphereGeometry(500, 60, 40);

      // 스카이박스 머티리얼 생성
      const skyboxMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide, // 내부면을 렌더링
      });

      // Mesh 생성
      const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

      // 스카이박스 위치 조정
      skybox.position.y += 65; // y좌표를 원하는 만큼 올립니다.
      skybox.position.z += 100;

      // 씬에 스카이박스 추가
      scene.add(skybox);
    },
    undefined,
    (error) => {
      console.error("배경 텍스처를 로드하는 중 오류가 발생했습니다:", error);
    }
  );
}
