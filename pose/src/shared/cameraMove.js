// 카메라 이동 애니메이션 함수
export const animateCameraMove = (camera, controls, targetPosition) => {
  // 카메라가 정의되지 않으면 함수 실행 중지
  if (!camera || !camera.position) {
    console.error("Camera is not defined or initialized.");
    return;
  }

  const duration = 1000; // 애니메이션 지속 시간 (1초)
  const startPosition = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  };
  const startTime = performance.now();

  const animateStep = (now) => {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1); // t는 0에서 1 사이의 값 (애니메이션 진행 정도)

    // 카메라가 중간에 삭제되었거나 초기화되지 않았는지 확인
    if (!camera || !camera.position) {
      console.error("Camera was lost during animation.");
      return;
    }

    // 카메라 위치 업데이트
    camera.position.set(
      startPosition.x + (targetPosition.x - startPosition.x) * t,
      startPosition.y + (targetPosition.y - startPosition.y) * t,
      startPosition.z + (targetPosition.z - startPosition.z) * t
    );

    controls.update();

    if (t < 1) {
      requestAnimationFrame(animateStep); // 애니메이션이 끝날 때까지 반복
    }
  };

  requestAnimationFrame(animateStep);
};
