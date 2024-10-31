import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

// 서버 URL에 맞게 수정
const socket = io('http://localhost:3002');

function Room() {
  const { roomName } = useParams(); // URL에서 방 이름 가져오기
  const navigate = useNavigate();
  const [users, setUsers] = useState([]); // 방에 있는 유저 목록
  const [readyStates, setReadyStates] = useState({}); // 유저의 준비 상태
  const [isReady, setIsReady] = useState(false); // 현재 유저의 준비 상태

  useEffect(() => {
    const username = sessionStorage.getItem('userId');
    
    // 방 이름과 유저 이름이 있는지 확인하는 디버깅 로그
    console.log(`Attempting to join room: ${roomName} as user: ${username}`);

    if (!socket.connected) {
      socket.connect();
    }

    if (username && roomName) {
      socket.emit('joinRoom', { roomName, username });
    }

    // 서버에서 업데이트된 유저 목록을 수신
    socket.on('updateUsers', (users) => {
      console.log('Updated users received in Room.js:', users); // 디버깅 로그
      setUsers(users);
    });

    // 준비 상태 업데이트 수신
    socket.on('updateReadyStates', (states) => {
      console.log('Updated ready states:', states); // 디버깅 로그
      setReadyStates(states);
    });

    // 게임 시작 이벤트 수신
    socket.on('startGame', () => {
      alert('게임이 시작됩니다!');
    });

    // 컴포넌트 언마운트 시 이벤트 핸들러 해제
    return () => {
      socket.off('updateUsers');
      socket.off('updateReadyStates');
      socket.off('startGame');
    };
  }, [roomName]);

  // 준비 상태 토글 함수
  const toggleReady = () => {
    setIsReady((prev) => !prev);
    console.log(`Toggling ready state for room ${roomName}`); // 디버깅 로그
    socket.emit('toggleReady', roomName);
  };

  // 방 나가기
  const handleExitRoom = () => {
    navigate('/lobby'); // 로비로 돌아가기
  };

  return (
    <div>
      <h1>Welcome to Room: {roomName}</h1>
      <div>
        <h2>Players in Room:</h2>
        {users.length > 0 ? (
          users.map((user, index) => (
            <div key={index}>
              {user} - {readyStates[user] ? 'Ready' : 'Not Ready'}
            </div>
          ))
        ) : (
          <div>No users in the room</div> // 유저 목록이 비어 있는 경우 메시지 출력
        )}
      </div>
      <button onClick={toggleReady}>{isReady ? 'Cancel Ready' : 'Ready'}</button>
      <button onClick={handleExitRoom}>나가기</button>
    </div>
  );
}

export default Room;
