// angleCalc.js

export const angleCalc = (data, indexA, indexB, indexC) => {
  const pointA = data[indexA];
  const pointB = data[indexB];
  const pointC = data[indexC];

  // 랜드마크 유효성 검사
  if (!pointA || !pointB || !pointC) {
    console.warn("Invalid landmarks for angle calculation");
    return null; // 각도를 null로 반환
  }

  // 벡터 계산
  const vectorBA = {
    x: pointA.x - pointB.x,
    y: pointA.y - pointB.y,
    z: pointA.z - pointB.z,
  };
  const vectorBC = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y,
    z: pointC.z - pointB.z,
  };

  // 내적과 벡터의 크기 계산
  const dotProduct =
    vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y + vectorBA.z * vectorBC.z;
  const magnitudeBA = Math.sqrt(
    vectorBA.x ** 2 + vectorBA.y ** 2 + vectorBA.z ** 2
  );
  const magnitudeBC = Math.sqrt(
    vectorBC.x ** 2 + vectorBC.y ** 2 + vectorBC.z ** 2
  );

  // 벡터 크기가 0인 경우 처리
  if (magnitudeBA === 0 || magnitudeBC === 0) {
    console.warn("Zero magnitude vector in angle calculation");
    return null;
  }

  // 각도 계산
  let cosAngle = dotProduct / (magnitudeBA * magnitudeBC);

  // cosAngle 값 클램핑
  cosAngle = Math.max(-1, Math.min(1, cosAngle));

  const angle = Math.acos(cosAngle) * (180 / Math.PI);

  return angle;
};
