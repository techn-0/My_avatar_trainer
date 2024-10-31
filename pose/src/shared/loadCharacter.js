import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export function loadCharacter(scene, onLoadComplete) {
  if (!scene) {
    console.error("Scene is not available. Cannot load character.");
    return;
  }

  const gltfLoader = new GLTFLoader();

  gltfLoader.load(
    "blackGirl/blackGirl.glb",
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

      scene.add(model);

      let mixer;
      let animations = {};

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);

        // 모든 애니메이션을 로드하여 이름 또는 인덱스로 접근할 수 있도록 저장
        gltf.animations.forEach((clip, index) => {
          const action = mixer.clipAction(clip);
          animations[index] = action;
        });

        // 기본 애니메이션 (예: 번호 5) 재생
        if (animations[8]) {
          animations[8].play();
        } else {
          console.warn("Animation 5 is not available.");
        }

        // 애니메이션 목록을 콘솔에 출력
        console.log("Animations found in the model:");
        gltf.animations.forEach((clip, index) => {
          console.log(`Animation ${index}: ${clip.name}`);
        });
      } else {
        console.warn("No animations found in this GLB model.");
      }

      if (onLoadComplete) {
        onLoadComplete(mixer, model, animations); // 애니메이션 믹서, 모델, 애니메이션 액션 객체를 반환
      }
    },
    undefined,
    function (error) {
      console.error("Error loading GLB model:", error);
    }
  );
}
