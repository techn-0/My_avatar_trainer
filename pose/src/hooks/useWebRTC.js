// src/hooks/useWebRTC.js
import { useEffect, useRef, useState } from "react";
import socket from "../services/socket";

export default function useWebRTC(roomName) {
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const peerConnectionRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    async function initWebRTC() {
      // 로컬 스트림 설정
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = localStream;

      // 피어 연결 설정
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = peerConnection;

      // 로컬 트랙을 피어 연결에 추가
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      // 원격 트랙이 추가될 때마다 이벤트 처리
      peerConnection.ontrack = (event) => {
        console.log("Received remote track");
        event.streams[0].getTracks().forEach((track) => {
          remoteStreamRef.current.addTrack(track);
        });
        setRemoteStream(remoteStreamRef.current);
      };

      // ICE 후보 생성 시 소켓을 통해 전송
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", { roomName, candidate: event.candidate });
        }
      };

      // 방에 참여
      socket.emit("joinWebRTC", roomName);

      // 소켓 이벤트 핸들러 설정
      socket.on("offer", async (offer) => {
        console.log("Received offer");
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("answer", { roomName, answer });
      });

      socket.on("answer", async (answer) => {
        console.log("Received answer");
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("iceCandidate", async ({ candidate }) => {
        console.log("Received ICE candidate");
        if (candidate) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

      // Cleanup on unmount
      return () => {
        console.log("Cleaning up WebRTC");
        socket.off("offer");
        socket.off("answer");
        socket.off("iceCandidate");
        peerConnection.close();
      };
    }

    initWebRTC();
  }, [roomName]);

  return { localStreamRef, remoteStream };
}