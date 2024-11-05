import { useEffect, useRef, useState } from "react";
import socket from "../services/socket";

export default function useWebRTC(roomName) {
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const peerConnectionRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    async function initWebRTC() {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = localStream;

      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = peerConnection;

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStreamRef.current.addTrack(track);
        });
        setRemoteStream(remoteStreamRef.current);
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", { roomName, candidate: event.candidate });
        }
      };

      socket.emit("joinWebRTC", roomName);

      socket.on("offer", async (offer) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("answer", { roomName, answer });
      });

      socket.on("answer", async (answer) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("iceCandidate", async ({ candidate }) => {
        if (candidate) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

      if (peerConnectionRef.current.signalingState === "stable") {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit("offer", { roomName, offer });
      }

      return () => {
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
