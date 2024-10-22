// utils/angleCalculator.js

/**
 * 세 점 A, B, C의 좌표를 받아서 ∠ABC 각도를 계산합니다.
 * @param {Array<number>} A - 점 A의 [x, y, z] 좌표
 * @param {Array<number>} B - 점 B의 [x, y, z] 좌표 (각도의 꼭짓점)
 * @param {Array<number>} C - 점 C의 [x, y, z] 좌표
 * @returns {number} 각도 (도 단위)
 */
export function calculateSquatAngle(A, B, C) {
  const AB = [A[0] - B[0], A[1] - B[1], A[2] - B[2]];
  const CB = [C[0] - B[0], C[1] - B[1], C[2] - B[2]];

  const dotProduct = AB[0] * CB[0] + AB[1] * CB[1] + AB[2] * CB[2];
  const magnitudeAB = Math.sqrt(AB[0] ** 2 + AB[1] ** 2 + AB[2] ** 2);
  const magnitudeCB = Math.sqrt(CB[0] ** 2 + CB[1] ** 2 + CB[2] ** 2);

  const angleRad = Math.acos(dotProduct / (magnitudeAB * magnitudeCB));
  const angleDeg = angleRad * (180 / Math.PI);

  return angleDeg;
}
