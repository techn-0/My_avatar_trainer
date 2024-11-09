import React, { useEffect, useState, useRef } from "react";
import RankingCard from "./RankingCard";
import "./ranking.css";
import { useNavigate } from "react-router-dom";

// 주소 전환
const apiUrl = process.env.REACT_APP_API_BASE_URL;
const frontendUrl = process.env.REACT_APP_FRONTEND_BASE_URL;

function RankingPage() {
  const glitchSoundRef = useRef(null); // 버튼 효과음 레퍼런스
  const [rankings, setRankings] = useState([]);
  const [exercise, setExercise] = useState("squat");
  const [duration, setDuration] = useState(1);

  const navigate = useNavigate();

  const fetchRanking = async () => {
    try {
      const response = await fetch(`${apiUrl}/workout/get_ranking`, {
        method: "POST", // GET에서 POST로 변경
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exercise: exercise,
          duration: duration,
        }), // 쿼리 파라미터 대신 body에 데이터 포함
      });
      const data = await response.json();
      setRankings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch ranking data", error);
      setRankings([]);
    }
  };

  // fetchRanking();

  useEffect(() => {
    fetchRanking();
  }, [exercise, duration]);

  const handleMouseEnter = () => {
    if (glitchSoundRef.current) {
      glitchSoundRef.current.currentTime = 0;
      glitchSoundRef.current.play().catch((error) => {
        // play() failed due to lack of user interaction. We can ignore this error.
        console.log(
          "Sound play prevented due to user interaction requirement."
        );
      });
    }
  };

  return (
    <div className="background">
      <div>
        <div className="rankin_main_btn_cnt">
          <div className="radio-wrapper cyberpunk">
            <input
              className="input"
              type="radio"
              name="btn"
              id="mainPage"
              onClick={() => navigate("/")}
              onMouseEnter={handleMouseEnter}
            />
            <div className="btn" onClick={() => navigate("/")}>
              <span aria-hidden="true"></span>메인페이지
              <span className="btn__glitch" aria-hidden="true">
                메인페이지
              </span>
            </div>
          </div>
        </div>

        <div className="ranking-page">
          <div className="opt">
            <div className="rankin_title">
              <h2>랭킹</h2>
              <div className="ranking_subtitle">
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
            </div>
          </div>
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
      <audio ref={glitchSoundRef} src="/sound/Glitch.wav" />
    </div>
  );
}

export default RankingPage;
