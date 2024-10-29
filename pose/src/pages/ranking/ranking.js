import React, { useEffect, useState } from "react";
import RankingCard from "./RankingCard";
import "./ranking.css";

function RankingPage() {
  const [rankings, setRankings] = useState([]);
  const [exercise, setExercise] = useState("squat");
  const [duration, setDuration] = useState(1);

  const fetchRanking = async () => {
    try {
      const response = await fetch(
        `http://localhost:3002/workout/get_ranking?exercise=${exercise}&duration=${duration}`
      );
      const data = await response.json();
      setRankings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch ranking data", error);
      setRankings([]);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, [exercise, duration]);

  return (
    <div className="ranking-page">
      <h2>랭킹 페이지</h2>

      <label>
        운동 종목:
        <select value={exercise} onChange={(e) => setExercise(e.target.value)}>
          <option value="squat">스쿼트</option>
          <option value="pushup">푸시업</option>
          <option value="plank">플랭크</option>
          <option value="situp">싯업</option>
          <option value="legraise">레그레이즈</option>
        </select>
      </label>

      <label>
        운동 시간:
        <select
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        >
          <option value={1}>1분</option>
          <option value={2}>2분</option>
          <option value={0.4}>24초</option>
          <option value={0.1}>6초</option>
        </select>
      </label>

      <div className="ranking-card-container">
        {rankings.length === 0 ? (
          <div>기록이 없습니다.</div>
        ) : (
          rankings.slice(0, 5).map((ranking, index) => (
            <div className="ranking_card" key={index}>
              <RankingCard
                rank={index + 1}
                userName={ranking.username}
                score={ranking.score}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RankingPage;
