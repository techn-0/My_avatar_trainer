import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import { Line, Radar } from "react-chartjs-2";
import "./ExerciseGraph.css";

// Chart.js에 필요한 구성 요소 등록.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

const ExerciseGraph = () => {
  const navigate = useNavigate();
  const [workoutData, setWorkoutData] = useState([]);
  const [loading, setLoading] = useState(true);

  // sessionStorage에서 로그인된 유저의 ID 가져오기
  const userId = sessionStorage.getItem('userId');

  // 운동 기록 데이터를 백엔드에서 가져오기
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch(`http://localhost:3002/workout?userId=${userId}`); // userId로 필터링
        const data = await response.json();
        setWorkoutData(data);  // 운동 기록 데이터를 상태로 저장
        setLoading(false);
      } catch (error) {
        console.error("Error fetching workout data:", error);
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // 가져온 운동 기록 데이터를 그래프용 데이터로 변환
  const lineData = {
    labels: workoutData.map((entry) => new Date(entry.date).toLocaleDateString()),  // 날짜 라벨
    datasets: [
      {
        label: "Push-ups",
        data: workoutData
          .filter((entry) => entry.exercise === "Push-ups")
          .map((entry) => entry.count),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Squats",
        data: workoutData
          .filter((entry) => entry.exercise === "Squats")
          .map((entry) => entry.count),
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Plank(minutes)",
        data: workoutData
          .filter((entry) => entry.exercise === "Plank")
          .map((entry) => entry.duration),
        borderColor: "rgba(255, 159, 64, 1)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // 최고 기록 (레이더 차트용)
  const radarData = {
    labels: ["Push-ups", "Squats", "Plank(minutes)"],
    datasets: [
      {
        label: "최고 기록",
        data: [
          Math.max(
            ...workoutData
              .filter((entry) => entry.exercise === "Push-ups")
              .map((entry) => entry.count)
          ),
          Math.max(
            ...workoutData
              .filter((entry) => entry.exercise === "Squats")
              .map((entry) => entry.count)
          ),
          Math.max(
            ...workoutData
              .filter((entry) => entry.exercise === "Plank")
              .map((entry) => entry.duration)
          ),
        ], // 각 운동의 최고 기록
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(255, 99, 132, 1)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const radarOptions = {
    responsive: true,
    scale: {
      ticks: { beginAtZero: true, max: 60 },
    },
  };

  // 페이지 이동
  const handleMainClick = () => {
    navigate("/"); // 메인 페이지로 이동
  };

  return (
    <>
      <div
        style={{
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
          background: "#fff",
          boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
        }}
      >
        {/* Return 버튼 */}
        <button
          className="Btn"
          style={{ marginBottom: "20px" }}
          onClick={handleMainClick}
        >
          <div className="sign">
            <svg viewBox="0 0 512 512">
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
            </svg>
          </div>
          <div className="text">Return</div>
        </button>

        {/* 그래프 블록 */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {/* 꺾은선 그래프 */}
          <div style={{ padding: "20px", width: "600px", background: "#fff" }}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              나의 기록
            </h2>
            <Line data={lineData} options={options} />
          </div>

          {/* 레이더 차트 */}
          <div style={{ padding: "20px", width: "400px", background: "#fff" }}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              최고 기록
            </h2>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ExerciseGraph;
