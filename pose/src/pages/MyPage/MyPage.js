import React, { useEffect, useState, useRef } from "react";
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
import { jwtDecode } from "jwt-decode";
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
  const glitchSoundRef = useRef(null); // 버튼 효과음 레퍼런스
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
        const response = await fetch(`${apiUrl}/comment/${ownerId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // JWT 토큰 추가
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: ownerId }),
        });
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
        const response = await fetch(`${apiUrl}/friends/pendingRequestList`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // JWT 토큰 추가
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: ownerId }),
        });
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
    maintainAspectRatio: false,
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
    plugins: {
      legend: {
        display: true, // 범례를 유지하고 싶다면 true, 제거하려면 false
      },
      tooltip: {
        enabled: true, // 툴팁 활성화
      },
    },
    scales: {
      r: { // 레이더 차트의 축 설정
        ticks: {
          display: false, // 숫자 표시 제거
          backdropColor: 'transparent', // 숫자 배경 투명화 (필요 시 추가)
        },

        pointLabels: {
          font: {

            color: 'white', // 텍스트 색상
          },
        },
      },
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
    <div className="myPage-container">
      {/* 상단 헤더 */}
      <header className="myPage-header">
        <div className="radio-wrapper cyberpunk">
          <input
            className="input"
            type="radio"
            name="btn"
            id="mainPage"
            onClick={handleMainClick}
            onMouseEnter={handleMouseEnter}
          />
          <div className="btn" onClick={handleMainClick}>
            <span aria-hidden="true"></span>메인페이지
            <span className="btn__glitch" aria-hidden="true">
              메인페이지
            </span>
          </div>
        </div>

        <h1>{ownerId} 님의 마이페이지</h1>
      </header>

      {/* 가로 스크롤 섹션 */}
      <div className="myPage-horizontalScroll">
        {/* 티어와 정보 섹션 */}
        <section className="myPage-tierSection glow-container">
          <div className="myPage-tierInfo">
            <h2>가장 좋아하는 운동: {favoriteExercise()}</h2>
            {lastVisitDays === "오늘" ? (
              <p>오늘도 운동을 하셨군요!</p>
            ) : consecutiveDays > 0 ? (
              <p>연속 접속일: {consecutiveDays}일</p>
            ) : (
              <p>오랜만입니다! {lastVisitDays}만에 접속하셨습니다.</p>
            )}
          </div>
          <div className="myPage-tierImage">
            {tier >= 1 && tier <= 5 && (
              <img src={preloadImages[tier - 1].src} alt={`Tier ${tier}`} />
            )}
            <h2>TIER {tier}</h2>
            <p>상위 {percentile}% 입니다!</p>
          </div>
        </section>

        {/* 운동 기록 섹션 */}
        <section className="myPage-recentRecordSection glow-container line-chart">
          <h2>최근 운동 기록</h2>
          <div className="chart-container">
            <Line data={lineData} options={options} />
          </div>
        </section>

        <section className="myPage-bestRecordSection glow-container">
          <h2>최고 기록</h2>
          <div className="chart-container">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </section>

        {/* 방명록 섹션 */}
        <section className="glow-container comment_box">
          <h2>방명록</h2>
          <div className="comments-container scrollable-box">
            {commentData.map((comment) => (
              <div key={comment._id} className="comment-card">
                <p>
                  <strong>작성자:</strong> {comment.userId}
                </p>
                <p>
                  <strong>작성일:</strong>{" "}
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
                <p>{comment.comment}</p>
                {userId === comment.userId && (
                  <button
                    className="cyberpunk-btn"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="comment-input">
            <input
              type="text"
              placeholder="내용을 입력하세요"
              value={comment}
              onChange={handleCommentChange}
            />
            <button className="cyberpunk-btn" onClick={handleSubmit}>
              제출
            </button>
          </div>
        </section>

        {/* 친구 관리 섹션 */}
        <section className="glow-container">
          <div className="friend-management comment-input">
            <h2>친구 추가</h2>
            <input
              type="text"
              placeholder="ID를 입력하세요"
              value={friendUserId}
              onChange={handleAddFriendChange}
              className="friend-input"
            />
            <button onClick={handleAddFriendSubmit} className="cyberpunk-btn">
              추가
            </button>

            <h2>유저 검색</h2>
            <input
              type="text"
              placeholder="ID를 입력하세요"
              value={searchUserId}
              onChange={handleSearchUserChange}
              className="friend-input"
            />
            <button onClick={handleSearchUser} className="cyberpunk-btn">
              검색
            </button>

            {searchResult && (
              <div
                className="search-result"
                onClick={() => handleFriendClick(searchResult.user.username)}
              >
                <p>검색된 유저 ID: {searchResult.user.username}</p>
              </div>
            )}
          </div>

          <div className="friend-list scrollable-box2">
            <h2>친구 목록</h2>
            {currentFriends.map((friend, index) => (
              <div key={index} className="friend-card">
                <p>{friend}</p>
                {userId === ownerId && (
                  <button
                    onClick={() => handleDeleteFriend(friend)}
                    className="cyberpunk-btn"
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="cyberpunk-btn"
            >
              이전
            </button>
            <button
              onClick={handleNextPage}
              disabled={
                currentPage >= Math.ceil(friendData.length / friendsPerPage)
              }
              className="cyberpunk-btn"
            >
              다음
            </button>
          </div>
        </section>
      </div>
      <audio ref={glitchSoundRef} src="/sound/Glitch.wav" />
    </div>
  );
};

export default MyPage;
