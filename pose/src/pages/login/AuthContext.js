// 쿠키에 JWT 토큰 저장 함수
const saveToken = (token) => {
  try {
    // 쿠키에 토큰 저장 (유효기간 1시간, Secure, SameSite 설정 추가)
    document.cookie = `token=${token}; max-age=3600; path=/; SameSite=Strict;`;
  } catch (error) {
    console.error("Error saving token to cookie", error);
  }
};

// 쿠키에서 토큰 삭제 함수
const removeToken = () => {
  try {
    // 쿠키에서 토큰 삭제 (만료 시간을 과거로 설정)
    document.cookie = `token=; max-age=0; path=/; SameSite=Strict; `;
    // sessionStorage에서 userId 삭제
    sessionStorage.removeItem("userId");
  } catch (error) {
    console.error("Error removing token from cookie", error);
  }
};

// 쿠키에서 저장된 토큰을 가져오는 함수
const getToken = () => {
  try {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((cookie) => cookie.startsWith("token="));
    if (tokenCookie) {
      return tokenCookie.split("=")[1]; // 토큰 값만 리턴
    } else {
      sessionStorage.removeItem("userId"); // 토큰이 없으면 userId 삭제
      return null;
    }
  } catch (error) {
    console.error("Error getting token from cookie", error);
    return null;
  }
};

export { saveToken, removeToken, getToken };
