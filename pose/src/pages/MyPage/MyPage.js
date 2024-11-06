import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PendingRequests from "./pendingRequests";
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
import "./MyPage.css";
import { getToken } from "../login/AuthContext";
import { jwtDecode } from 'jwt-decode';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
} from "@mui/material"; // MUI 카드 컴포넌트
import DeleteIcon from "@mui/icons-material/Delete"; // 삭제 아이콘

// 주소 전환
const apiUrl = process.env.REACT_APP_API_BASE_URL;
const frontendUrl = process.env.REACT_APP_FRONTEND_BASE_URL;

const imageNames = ["t1.png", "t2.png", "t3.png", "t4.png", "t5.png"];
const preloadImages = imageNames.map((name) => {
  const img = new Image();
  img.src = `${process.env.PUBLIC_URL}/tier/${name}`;
  return img;
});

// Chart.js 구성 요소 등록
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

const MyPage = () => {
  const navigate = useNavigate();
  const { ownerId } = useParams(); // URL에서 ownerId를 가져옵니다.
  const [workoutData, setWorkoutData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(1); // 1분 또는 2분 선택
  const [comment, setComment] = useState("");
  const [friendUserId, setFriendUserId] = useState("");
  const [searchUserId, setSearchUserId] = useState("");
  const [friendData, setFriendData] = useState([]); // 빈 배열로 초기화
  const [commentData, setCommentData] = useState([]);
  const [pendingRequest, setPendingRequest] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 추가
  const friendsPerPage = 4; // 페이지당 친구 수
  const [tier, setTier] = useState("");
  const [percentile, setPercentile] = useState("");

  // 페이지에 표시할 친구 데이터 계산
  const indexOfLastFriend = currentPage * friendsPerPage;
  const indexOfFirstFriend = indexOfLastFriend - friendsPerPage;
  const currentFriends = friendData.slice(
    indexOfFirstFriend,
    indexOfLastFriend
  );
  const handleNextPage = () => {
    if (currentPage < Math.ceil(friendData.length / friendsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const token = getToken();
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.id;
  // 마지막 접속 날짜와 연속 로그인 일수를 위한 상태 추가
  const [lastVisitDays, setLastVisitDays] = useState(null);
  const [consecutiveDays, setConsecutiveDays] = useState(0);

  // 운동 기록 데이터를 백엔드에서 가져오기
  
  useEffect(() => {
    //////////////////////// 티어 구현 /////////////////////////////////////////////////

    const fetchTier = async () => {
      try {
        const response = await fetch(`${apiUrl}/tier/${ownerId}`, {
          method: "POST", // GET에서 POST로 변경
          headers: {
            Authorization: `Bearer ${token}`, // JWT 토큰 추가
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: ownerId }), // 필요한 데이터가 있다면 body에 포함
        });
        const data = await response.json();
        setTier(data.tier);
        setPercentile(data.percentile);
        console.log("your tier for real: ", data.tier);
      } catch (error) {
        console.error("Error fetching tier data:", error);
      }
    };

    fetchTier();

    console.log("게시판 주인: ", ownerId, ", 로그인된 유저: ", userId);
    const fetchComments = async () => {
      try {
        // GET에서 POST로 변경하고, 데이터를 body에 포함
        const response = await fetch(
          `${apiUrl}/comment/${ownerId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`, // JWT 토큰 추가
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: ownerId }),
          }
        );
        const data = await response.json();
        console.log("your comment", data);
        setCommentData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setLoading(false);
      }
    };
    fetchComments();
    const fetchFriends = async () => {
      try {
        const response = await fetch(`${apiUrl}/friends/list`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // JWT 토큰 추가
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: ownerId }),
        });
        const data = await response.json();
        console.log("friend list: ", data);
        setFriendData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching friend list:", error);
        setLoading(false);
      }
    };
    fetchFriends();
    //
    const fetchRequests = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/friends/pendingRequestList`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`, // JWT 토큰 추가
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: ownerId }),
          }
        );
        const data = await response.json();
        console.log("pending requests: ", data);
        setPendingRequest(data); // 전체 요청 배열로 설정
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        setLoading(false);
      }
    };
    fetchRequests();
    //
    const fetchWorkouts = async () => {
      try {
        const response = await fetch(`${apiUrl}/workout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // JWT 토큰 추가
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            duration: selectedDuration,
            username: ownerId,
          }),
        });
        const data = await response.json();
        console.log(data);
        setWorkoutData(data); // 운동 기록 데이터를 상태로 저장
        setLoading(false);

        // 마지막 접속 날짜와 연속 로그인 일수 계산
        calculateVisitStats(data);
      } catch (error) {
        console.error("Error fetching workout data:", error);
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [selectedDuration, ownerId, userId]); // 선택한 시간 또는 ownerId 변경 시 데이터 다시 불러오기

  // 마지막 접속 날짜와 연속 로그인 일수 계산 함수
  const calculateVisitStats = (data) => {
    if (data.length === 0) return;

    // 날짜 문자열을 Date 객체로 변환하고 정렬
    const dates = data
      .map((entry) => {
        const [year, month, day] = entry.date.split("-");
        return new Date(`${year}-${month}-${day}T00:00:00`);
      })
      .sort((a, b) => b - a); // 최신 날짜 순으로 정렬

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastVisit = new Date(dates[0]);
    lastVisit.setHours(0, 0, 0, 0);
    const diffTime = today - lastVisit;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 0) {
      setLastVisitDays("오늘");
    } else if (diffDays === 1) {
      setLastVisitDays("어제");
      setConsecutiveDays(2); // 연속 접속 2일차
    } else {
      setLastVisitDays(`${diffDays}일 만에`);
      setConsecutiveDays(0); // 연속 접속 초기화
    }

    // 연속 로그인 일수 계산
    let consecutive = 1;
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      const diff = (prevDate - currDate) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        consecutive++;
      } else {
        break;
      }
    }

    if (diffDays <= 1 && consecutive > 1) {
      setConsecutiveDays(consecutive);
    } else {
      setConsecutiveDays(0);
    }
  };

  // 가장 좋아하는 운동 계산 (기록이 가장 많은 운동)
  const favoriteExercise = () => {
    const exerciseCounts = {};

    workoutData.forEach((entry) => {
      if (!exerciseCounts[entry.exercise]) {
        exerciseCounts[entry.exercise] = entry.count;
      } else {
        exerciseCounts[entry.exercise] += entry.count;
      }
    });

    const sortedExercises = Object.entries(exerciseCounts).sort(
      (a, b) => b[1] - a[1]
    );

    return sortedExercises.length > 0
      ? sortedExercises[0][0]
      : "운동 기록 없음";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // 시간 선택 옵션
  const handleDurationChange = (e) => {
    setSelectedDuration(Number(e.target.value)); // 선택한 시간 업데이트
  };

  // 가져온 운동 기록 데이터를 그래프용 데이터로 변환
  const lineData = {
    labels: workoutData.map((entry) => {
      // 문자열 "2024-10-21-00:00"에서 연, 월, 일을 추출
      const [year, month, day] = entry.date.split("-");

      // 새로운 Date 객체를 생성하여 날짜를 정확히 설정
      const date = new Date(`${year}-${month}-${day}T00:00:00`);

      // 'YYYY-MM-DD' 형식으로 표시
      return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    }),
    datasets: [
      {
        label: "Squat",
        data: workoutData
          .filter((entry) => entry.exercise === "squat")
          .map((entry) => entry.count),
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Push-up",
        data: workoutData
          .filter((entry) => entry.exercise === "pushup")
          .map((entry) => entry.count),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Plank(minutes)",
        data: workoutData
          .filter((entry) => entry.exercise === "plank")
          .map((entry) => entry.count),
        borderColor: "rgba(255, 159, 64, 1)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Burpee",
        data: workoutData
          .filter((entry) => entry.exercise === "burpee")
          .map((entry) => entry.count),
        borderColor: "rgba(30, 109, 34, 1)",
        backgroundColor: "rgba(30, 109, 34, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Sit-up",
        data: workoutData
          .filter((entry) => entry.exercise === "situp")
          .map((entry) => entry.count),
        borderColor: "rgba(10, 190, 54, 1)",
        backgroundColor: "rgba(10, 190, 54, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // 최고 기록 (레이더 차트용)
  const radarData = {
    labels: ["Squat", "Push-up", "Plank(minutes)", "Burpee", "Sit-up"],
    datasets: [
      {
        label: "최고 기록",
        data: [
          Math.max(
            0,
            ...workoutData
              .filter((entry) => entry.exercise === "squat")
              .map((entry) => entry.count)
          ),
          Math.max(
            0,
            ...workoutData
              .filter((entry) => entry.exercise === "pushup")
              .map((entry) => entry.count)
          ),
          Math.max(
            0,
            ...workoutData
              .filter((entry) => entry.exercise === "plank")
              .map((entry) => entry.count)
          ),
          Math.max(
            0,
            ...workoutData
              .filter((entry) => entry.exercise === "burpee")
              .map((entry) => entry.count)
          ),
          Math.max(
            0,
            ...workoutData
              .filter((entry) => entry.exercise === "situp")
              .map((entry) => entry.count)
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

  // 방명록 내용 상태 관리
  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  // 방명록 제출 핸들러
  const handleSubmit = async () => {
    if (!comment) {
      alert("내용을 입력해주세요.");
      return;
    }

    const data = {
      ownerId: ownerId,
      userId: userId,
      comment: comment,
      profilePic: "",
    };

    try {
      const response = await fetch(`${apiUrl}/comment/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        
        const addedComment = await response.json();
        setCommentData((prevComments) => [...prevComments, addedComment]);
        setComment("");
        alert("코멘트가 작성되었습니다.");
      } else {
        console.log(data);
        alert("코멘트 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  // 방명록 삭제
  const handleDeleteComment = async (_id) => {
    try {
      const response = await fetch(
        `http://localhost:3002/comment/delete/${_id}`,
        {
          method: "Delete",
          headers: {
            Authorization: `Bearer ${token}`, // JWT 토큰 추가
            "Content-Type": "application/json",
          },
          body: JSON.stringify(),
        }
      );
      if (response.ok) {
        alert("삭제되었습니다.");
        setCommentData((prevComments) =>
          prevComments.filter((comment) => comment._id !== _id)
        );
      } else {
        console.log(_id);
        alert("삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting friend:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  // Friend function
  // 친구 ID 내용 상태 관리
  const handleAddFriendChange = (e) => {
    setFriendUserId(e.target.value);
  };
  // Find User 내용 상태 관리
  const handleSearchUserChange = (e) => {
    setSearchUserId(e.target.value);
  };

  // 친구 삭제 함수
  const handleDeleteFriend = async (friendUserId) => {
    try {
      const response = await fetch(
        `${apiUrl}/friends/delete`, // 친구 삭제 API 엔드포인트
        {
          method: "Delete",
          headers: {
            Authorization: `Bearer ${token}`, // JWT 토큰 추가
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: ownerId, friendUserId }),
        }
      );
      if (response.ok) {
        // 삭제 성공 시 친구 목록에서 해당 친구 제거
        setFriendData((prevFriends) =>
          prevFriends.filter((friend) => friend !== friendUserId)
        );
        alert("친구가 삭제되었습니다.");
      } else {
        alert("친구 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting friend:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  // 유저 검색 함수
  const handleSearchUser = async () => {
    try {
      const response = await fetch(`${apiUrl}/friends/findUser`, {
        method: "POST", // GET에서 POST로 변경
        headers: {
          Authorization: `Bearer ${token}`, // JWT 토큰 추가
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: searchUserId }),
      });
      const data = await response.json();
      console.log(data);
      setSearchResult(data); // 검색 결과 상태에 유저 ID 저장
      if (!response.ok) {
        alert("그런 유저는 없는데요");
        setSearchResult(null);
      }
    } catch (error) {
      alert("서버 오류가 발생했습니다.");
      setSearchResult(null);
    }
  };

  const handleFriendClick = (friendUserId) => {
    navigate(`/user/${friendUserId}`);
  };

  // 친구 제출 핸들러
  const handleAddFriendSubmit = async () => {
    if (!friendUserId) {
      alert("친구의 ID를 입력해주세요.");
      return;
    }

    const data = {
      userId,
      friendUserId,
    };

    try {
      const response = await fetch(`${apiUrl}/friends/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("요청을 보냈어요!.");
      } else {
        alert("요청을 보내지 못했어요.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };
  const handleRequestUpdate = (friendUserId) => {
    setPendingRequest((prevRequests) =>
      prevRequests.filter((request) => request.userId !== friendUserId)
    );
  };

  return (
    <div className="container">
      <div
        className="main"
        style={{
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
          boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
          backgroundColor: "White",
          borderRadius: "8px",
        }}
      >
        {/* Return 버튼 */}
        <button className="Btn" onClick={handleMainClick}>
          <div className="sign">
            <svg viewBox="0 0 512 512">
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
            </svg>
          </div>
          <div className="text">Return</div>
        </button>
        {/* div1 */}
        <div className="div1" style={{ display: "flex" }}>
          <div>
            <h1>{ownerId} 님의 페이지입니다.</h1>
            <p>가장 좋아하는 운동: {favoriteExercise()}</p>
            {lastVisitDays === "오늘" ? (
              <p>오늘도 운동을 하셨군요!</p>
            ) : consecutiveDays > 0 ? (
              <p>연속 접속일: {consecutiveDays}일</p>
            ) : (
              <p>오랜만입니다! {lastVisitDays} 접속하셨습니다.</p>
            )}
          </div>
          <div style={{ display: "flex", margin: "auto" }}>
            {tier >= 1 && tier <= 5 && (
              <img
                style={{ width: "200px" }}
                src={preloadImages[tier - 1].src}
                // alt={`Tier ${tier}`}
                className="tier-image"
              />
            )}
           <div style={{ display: "flex", flexDirection: "column", marginLeft: "20px" }}>
            <div style={{ fontSize: "80px" }}>TIER {tier}</div>
            <div style={{ fontSize: "30px" }}>상위 {percentile}% 입니다!</div>
          </div>
          </div>
          
        </div>

        {/* div2 */}
        <div className="div2">
          {/* 그래프 블록 */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {/* 꺾은선 그래프 */}
            <div
              style={{
                padding: "20px",
                width: "600px",
                background: "#fff",
                borderRadius: "15px",
              }}
            >
              {/* 운동 시간 선택 */}
              <label className="cta">
                <span>⏰</span>
                <svg width="15px" height="10px" viewBox="0 0 13 10">
                  <path d="M1,5 L11,5"></path>
                  <polyline points="8 1 12 5 8 9"></polyline>
                </svg>
                <select
                  value={selectedDuration}
                  onChange={handleDurationChange}
                  style={{
                    position: "absolute",
                    zIndex: 2,
                    margin: "3px 5px 10px 10px",
                  }}
                >
                  <option value={1}>1분 기록</option>
                  <option value={2}>2분 기록</option>
                </select>
              </label>
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
            <div
              style={{
                padding: "20px",
                width: "400px",
                background: "#fff",
                borderRadius: "15px",
              }}
            >
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

        {/* div3 */}
        <div className="div3">
          <div style={{ display: "flex", gap: "10px" }}>
            <div
              style={{
                width: "60%",
                flexGrow: 1,
                padding: "10px",
              }}
            >
              <h2>방명록</h2>
              <div>
                {commentData.map((comment) => (
                  <Card
                    key={comment._id}
                    sx={{ margin: "10px 0", position: "relative" }}
                  >
                    <CardContent>
                      <Typography variant="body1" color="textPrimary">
                        작성자: {comment.userId}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        작성일:{" "}
                        {new Date(comment.createdAt).toISOString().slice(0, 10)}{" "}
                        {new Date(comment.createdAt).toISOString().slice(11, 16)}
                      </Typography>
                      <Typography variant="body1" sx={{ marginTop: "5px" }}>
                        {comment.comment}
                      </Typography>
                      {userId === comment.userId && (
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDeleteComment(comment._id)}
                          style={{ position: "absolute", top: 8, right: 8 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <input
                type="text"
                placeholder="내용을 입력하세요"
                style={{ width: "400px", height: "50px" }}
                value={comment}
                onChange={handleCommentChange}
              />
              <button
                className="submitComment"
                type="submit"
                style={{ width: "70px", height: "50px", padding: "10px" }}
                onClick={handleSubmit}
              >
                제출
              </button>
            </div>
          </div>
        </div>
        {/* div3 */}
        <div className="div3">
          <div style={{ display: "flex", gap: "10px" }}>
            <div
              style={{
                width: "30%",
                flexGrow: 1,
                padding: "10px",
              }}
            >
              <h2>친구추가 기능</h2>
              <input
                type="text"
                placeholder="ID를 입력하세요"
                style={{ width: "400px", height: "50px" }}
                value={friendUserId}
                onChange={handleAddFriendChange}
              />
              <button
                className="submitAddFriend"
                type="submit"
                style={{ width: "70px", height: "50px", padding: "10px" }}
                onClick={handleAddFriendSubmit}
              >
                제출
              </button>
              <h2>유저검색 기능</h2>
              <input
                type="text"
                placeholder="ID를 입력하세요"
                style={{ width: "400px", height: "50px" }}
                value={searchUserId}
                onChange={handleSearchUserChange}
              />
              <button
                className="submitSearchUser"
                type="submit"
                style={{ width: "70px", height: "50px", padding: "10px" }}
                onClick={handleSearchUser}
              >
                제출
              </button>
              {searchResult && (
                <div
                  style={{
                    marginTop: "10px",
                    color: "green",
                    cursor: "pointer",
                  }}
                  onClick={() => handleFriendClick(searchResult.user.username)}
                >
                  <div
                    style={{
                      width: "470px",
                      height: "50px",
                      border: "1px solid black",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    검색된 유저 ID: {searchResult.user.username}{" "}
                  </div>
                </div>
              )}
            </div>
            <div
              style={{
                flexGrow: 1,
                border: "2px solid black",
                borderRadius: "30px",
                padding: "10px",
              }}
            >
              <h2>친구 목록</h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {currentFriends.map((friend, index) => (
                  <Card
                    key={`${friend}-${index}`}
                    sx={{ minWidth: 100, height: "50px" }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body1"
                        style={{ cursor: "pointer", color: "blue" }}
                        onClick={() => handleFriendClick(friend)}
                      >
                        {friend}
                      </Typography>
                      {userId === ownerId && (
                        <IconButton
                          onClick={() => handleDeleteFriend(friend)}
                          color="secondary"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* 페이지 네비게이션 버튼 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "10px",
                }}
              >
                <Button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                <Button
                  onClick={handleNextPage}
                  disabled={
                    currentPage >= Math.ceil(friendData.length / friendsPerPage)
                  }
                >
                  다음
                </Button>
              </div>

              <div>
                {userId === ownerId && pendingRequest.length > 0 && (
                  <PendingRequests
                    pendingRequests={pendingRequest} // Updated here
                    onRequestUpdate={handleRequestUpdate} // 추가된 핸들러
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
