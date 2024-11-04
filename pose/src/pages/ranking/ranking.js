import React, { useEffect, useState } from "react";
import RankingCard from "./RankingCard";
import "./ranking.css";
import { useNavigate } from "react-router-dom";

function RankingPage() {
  const [rankings, setRankings] = useState([]);
  const [exercise, setExercise] = useState("squat");
  const [duration, setDuration] = useState(1);

  const navigate = useNavigate();

  const fetchRanking = async () => {
    try {
      const response = await fetch(
        `http://localhost:3002/workout/get_ranking`,
        {
          method: "POST", // GET에서 POST로 변경
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exercise: exercise,
            duration: duration,
          }), // 쿼리 파라미터 대신 body에 데이터 포함
        }
      );
      const data = await response.json();
      setRankings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch ranking data", error);
      setRankings([]);
    }
  };

  fetchRanking();

  useEffect(() => {
    fetchRanking();
  }, [exercise, duration]);

  return (
    <div className="background">
      <button className="back-to-main-button" onClick={() => navigate("/")}>
        메인으로 돌아가기
      </button>
      <div className="ranking-page">
        <div className="opt">
          <h2>랭킹</h2>

          <label>
            운동 종목:&nbsp;
            <select
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
            >
              <option value="squat">스쿼트</option>
              <option value="pushup">푸시업</option>
              <option value="plank">플랭크</option>
              <option value="situp">싯업</option>
              <option value="legraise">레그레이즈</option>
            </select>
          </label>

          <label>
            운동 시간:&nbsp;
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
        </div>

        <div className="pyramid-container">
          {rankings.slice(0, 5).map((ranking, index) => (
            <div
              className={`pyramid-rank pyramid-rank-${index + 1}`}
              key={index}
            >
              <RankingCard
                rank={index + 1}
                userName={ranking.username}
                score={ranking.score}
              />
              <div className={`podium podium-${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RankingPage;
