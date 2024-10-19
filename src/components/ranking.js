import React, { useEffect, useState, useRef } from "react";
import "./ranking.css";

// 사용자 데이터
const usersData = [
  { name: "Alice", pushups: 40, squats: 50, plank: 3 },
  { name: "Bob", pushups: 35, squats: 40, plank: 2.5 },
  { name: "Charlie", pushups: 45, squats: 35, plank: 4 },
  { name: "David", pushups: 25, squats: 30, plank: 2 },
  { name: "Eve", pushups: 30, squats: 60, plank: 3.5 },
  { name: "A", pushups: 31, squats: 60, plank: 1.5 },
  { name: "B", pushups: 32, squats: 60, plank: 2.5 },
  { name: "C", pushups: 33, squats: 60, plank: 3.5 },
  { name: "D", pushups: 34, squats: 60, plank: 4 },
  { name: "E", pushups: 35, squats: 60, plank: 5.5 },
  { name: "F", pushups: 36, squats: 60, plank: 5.5 },
  { name: "G", pushups: 37, squats: 60, plank: 5.5 },
  { name: "H", pushups: 38, squats: 60, plank: 6.5 },
  { name: "I", pushups: 39, squats: 60, plank: 7.5 },
  { name: "J", pushups: 40, squats: 60, plank: 3.5 },
  { name: "K", pushups: 41, squats: 60, plank: 3.5 },
  { name: "L", pushups: 42, squats: 60, plank: 3.5 },
  { name: "M", pushups: 43, squats: 60, plank: 3.5 },
  { name: "N", pushups: 44, squats: 60, plank: 3.5 },
  { name: "O", pushups: 45, squats: 60, plank: 3.5 },
  { name: "P", pushups: 46, squats: 60, plank: 3.5 },
  { name: "Q", pushups: 47, squats: 60, plank: 3.5 },
  { name: "R", pushups: 48, squats: 60, plank: 3.5 },
  { name: "S", pushups: 49, squats: 60, plank: 3.5 },
  { name: "T", pushups: 50, squats: 60, plank: 3.5 },
];

const RankingPage = () => {
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
  const [foundUser, setFoundUser] = useState(null); // 검색된 유저
  const [isSearching, setIsSearching] = useState(false); // 검색 버튼을 눌렀는지 상태
  const [selectedExercise, setSelectedExercise] = useState("pushups"); // 선택된 종목 상태
  const userRefs = useRef({}); // 유저들의 참조값 저장

  // 정렬 함수
  const getSortedRanking = (exercise) => {
    return usersData
      .slice() // 원본 배열을 변경하지 않기 위해 복사
      .sort((a, b) => b[exercise] - a[exercise]); // 종목별로 기록을 기준으로 내림차순 정렬
  };

  // 각 종목별 정렬된 데이터를 저장
  const pushupsRanking = getSortedRanking("pushups");
  const squatsRanking = getSortedRanking("squats");
  const plankRanking = getSortedRanking("plank");

  // 유저 검색 함수
  const handleSearch = () => {
    setIsSearching(true); // 검색 버튼을 누르면 true로 변경
    if (searchTerm.trim() === "") {
      setFoundUser(null); // 빈 문자열일 경우 검색 결과를 초기화
      return;
    }

    const user = usersData.find((user) =>
      user.name.toLowerCase() === searchTerm.toLowerCase()
    );
    setFoundUser(user);

    if (user) {
      // 해당 유저의 요소로 스크롤
      const ref = userRefs.current[user.name];
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  // 각 종목별 순위 계산
  const getUserRank = (user, ranking) => {
    return ranking.findIndex((rankUser) => rankUser.name === user.name) + 1;
  };

  // 선택된 종목에 따라 해당 종목의 랭킹을 렌더링
  const getSelectedRanking = () => {
    switch (selectedExercise) {
      case "pushups":
        return pushupsRanking;
      case "squats":
        return squatsRanking;
      case "plank":
        return plankRanking;
      default:
        return [];
    }
  };

  return (
    <div className="block">
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        운동 종목별 랭킹
      </h1>

      {/* 종목 선택 드롭다운 */}
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="exercise-select">종목을 선택하세요:</label>
        <select
          id="exercise-select"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          style={{
            margin: "20px",
            padding: "10px",
            width: "90%",
            marginBottom: "10px",
          }}
        >
          <option value="pushups">푸시업</option>
          <option value="squats">스쿼트</option>
          <option value="plank">플랭크</option>
        </select>
      </div>

      {/* 검색 기능 */}
      <div style={{ margin: "20px" }}>
        <input
          type="text"
          placeholder="유저 이름을 검색하세요"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value); // 검색어 업데이트
            setIsSearching(false); // 검색어 입력 중에는 검색 상태를 false로
          }}
          style={{ padding: "10px", width: "90%", marginBottom: "10px" }}
        />
        <button
          onClick={handleSearch}
          style={{ padding: "10px", width: "30%" }}
        >
          검색
        </button>
      </div>

      {/* 검색 결과 */}
      {isSearching && searchTerm !== "" && !foundUser ? (
        <p>검색 결과가 없습니다.</p>
      ) : null}

      {foundUser ? (
        <div style={{ marginBottom: "20px" }}>
          <h3>검색 결과:</h3>
          <p>이름: {foundUser.name}</p>
          <p>
            푸시업: {foundUser.pushups}회 (순위:{" "}
            {getUserRank(foundUser, pushupsRanking)}위)
          </p>
          <p>
            스쿼트: {foundUser.squats}회 (순위:{" "}
            {getUserRank(foundUser, squatsRanking)}위)
          </p>
          <p>
            플랭크: {foundUser.plank}분 (순위:{" "}
            {getUserRank(foundUser, plankRanking)}위)
          </p>
        </div>
      ) : null}

      {/* 선택된 종목의 랭킹 */}
      <div style={{ marginBottom: "20px" }}>
        <h2>
          {selectedExercise === "pushups"
            ? "Push-ups"
            : selectedExercise === "squats"
            ? "Squats"
            : "Plank"}{" "}
          랭킹
        </h2>
        <ol>
          {getSelectedRanking().map((user, index) => (
            <li
              key={index}
              ref={(el) => (userRefs.current[user.name] = el)} // 유저의 ref 저장
            >
              {index + 1}. {user.name} -{" "}
              {selectedExercise === "pushups"
                ? `${user.pushups}회`
                : selectedExercise === "squats"
                ? `${user.squats}회`
                : `${user.plank}분`}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RankingPage;
