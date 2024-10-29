// 스쿼트 각도 계산 함수 (왼쪽/오른쪽 다리 모두 고려)
//# 7,8 Ear / 11,12  Shoulder / 13,14 elbow / 23,24 waist / 25,26 knee / 27,28 ankle / 15, 16 Wrist

export const angleCalc = (data, side, landidx1, landidx2, landidx3) => {
    // Index Ear = 0, Neck = 1, Elbow = 2, Waist = 3, Knee = 4, Ankle = 5, Wrist = 6
    const LandmarkList = [[7,8], [11,12], [13,14], [23, 24], [25,26], [27,28],[15, 16]]

    const index1 = side === "left" ? LandmarkList[landidx1][0]: LandmarkList[landidx1][1]; // Neck 11 : 12;
    const index2 = side === "left" ? LandmarkList[landidx2][0]: LandmarkList[landidx2][1];  // Waist 23 : 24;
    const index3 = side === "left" ? LandmarkList[landidx3][0]: LandmarkList[landidx3][1]; // Knee 25 : 26; 
  
    const a = [data[index1].x, data[index1].y, data[index1].z]; // 인자 1  
    const b = [data[index2].x, data[index2].y, data[index2].z]; // 인자 2  
    const c = [data[index3].x, data[index3].y, data[index3].z]; // 인자 3  
    
    // 각 Vector의 Dot product를 구해서 Scalar 값을 구한다. 
    const dotProduct =
      (a[0] - b[0]) * (c[0] - b[0]) +
      (a[1] - b[1]) * (c[1] - b[1]) +
      (a[2] - b[2]) * (c[2] - a[2]);
    
    // 각 Vector의 Length를 구하고 두 길이의 값을 각각 구해서 곱한다.
    const ABlength = Math.sqrt(
      Math.pow(a[0] - b[0], 2) +
        Math.pow(a[1] - b[1], 2) +
        Math.pow(a[2] - b[2], 2)
    );
    
    const BCLength = Math.sqrt(
      Math.pow(c[0] - b[0], 2) +
        Math.pow(c[1] - b[1], 2) +
        Math.pow(c[2] - b[2], 2)
    );
    
    // Cosθ = Dot product / (Length A * Length B )
    const cos = dotProduct / (ABlength * BCLength);
    // Arc Cos 을 통한 Radian 값 계산과 360도 기준의 각도 계산
    return Math.acos(cos) * (180 / Math.PI); 
  };


  // export const angleSpecCalc = (data, side1, landidx1, side2, landidx2, side3, landidx3) => {
  //   // Index Ear = 0, Neck = 1, Elbow = 2, Waist = 3, Knee = 4, Ankle = 5, Wrist = 6
  //   const LandmarkList = [[7,8], [11,12], [13,14], [23, 24], [25,26], [27,28], [15,16]]

  //   const index1 = side1 === "left" ? LandmarkList[landidx1][0]: LandmarkList[landidx1][1]; // Neck 11 : 12;
  //   const index2 = side2 === "left" ? LandmarkList[landidx2][0]: LandmarkList[landidx2][1];  // Waist 23 : 24;
  //   const index3 = side3 === "left" ? LandmarkList[landidx3][0]: LandmarkList[landidx3][1]; // Knee 25 : 26; 
  
  //   const a = [data[index1].x, data[index1].y, data[index1].z]; // 인자 1  
  //   const b = [data[index2].x, data[index2].y, data[index2].z]; // 인자 2  
  //   const c = [data[index3].x, data[index3].y, data[index3].z]; // 인자 3  
    
  //   // 각 Vector의 Dot product를 구해서 Scalar 값을 구한다. 
  //   const dotProduct =
  //     (a[0] - b[0]) * (c[0] - b[0]) +
  //     (a[1] - b[1]) * (c[1] - b[1]) +
  //     (a[2] - b[2]) * (c[2] - a[2]);
    
  //   // 각 Vector의 Length를 구하고 두 길이의 값을 각각 구해서 곱한다.
  //   const ABlength = Math.sqrt(
  //     Math.pow(a[0] - b[0], 2) +
  //       Math.pow(a[1] - b[1], 2) +
  //       Math.pow(a[2] - b[2], 2)
  //   );
    
  //   const BCLength = Math.sqrt(
  //     Math.pow(c[0] - b[0], 2) +
  //       Math.pow(c[1] - b[1], 2) +
  //       Math.pow(c[2] - b[2], 2)
  //   );
    
  //   // Cosθ = Dot product / (Length A * Length B )
  //   const cos = dotProduct / (ABlength * BCLength);
  //   // Arc Cos 을 통한 Radian 값 계산과 360도 기준의 각도 계산
  //   return Math.acos(cos) * (180 / Math.PI); 
  // };