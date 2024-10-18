import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export function loadCharacter(scene, onLoadComplete) {
  if (!scene) {
    console.error("Scene is not available. Cannot load character.");
    return;
  }

  const gltfLoader = new GLTFLoader();
  const textureLoader = new THREE.TextureLoader(); // 텍스처 로더

  gltfLoader.load(
    "blackGirl/girl.glb",
    function (gltf) {
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      model.scale.set(1, 1, 1);

      model.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(model); // scene이 올바르게 추가됨을 확인

      let mixer;
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(gltf.animations[0]); // 첫 번째 애니메이션 선택
        action.play(); // 애니메이션 시작
      } else {
        console.warn("No animations found in this GLB model.");
      }

      if (onLoadComplete) {
        onLoadComplete(mixer, model, gltf.animations); // 애니메이션 믹서, 모델, 애니메이션을 반환
      }
    },
    undefined,
    function (error) {
      console.error("Error loading GLB model:", error);
    }
  );
}
