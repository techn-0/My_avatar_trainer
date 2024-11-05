// src/hooks/useWebRTC.js
import { useEffect, useRef, useState } from "react";
import socket from "../services/socket";

export default function useWebRTC(roomName) {
  const localStreamRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const peerConnections = useRef({});

  useEffect(() => {
    async function initLocalStream() {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = localStream;

        socket.emit("joinWebRTC", roomName);

        socket.on("newPeer", async (peerId) => {
          if (!peerConnections.current[peerId]) {
            await createPeerConnection(peerId, true);
          }
        });

        socket.on("offer", async ({ from, offer }) => {
          if (!peerConnections.current[from]) {
            await createPeerConnection(from, false);
          }
          const pc = peerConnections.current[from];
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { to: from, answer: pc.localDescription });
        });

        socket.on("answer", async ({ from, answer }) => {
          const pc = peerConnections.current[from];
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        socket.on("iceCandidate", async ({ from, candidate }) => {
          const pc = peerConnections.current[from];
          if (pc) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.error("Error adding received ice candidate", e);
            }
          }
        });

        socket.on("removePeer", (peerId) => {
          if (peerConnections.current[peerId]) {
            peerConnections.current[peerId].close();
            delete peerConnections.current[peerId];
            setRemoteStreams((prevStreams) => {
              const updatedStreams = { ...prevStreams };
              delete updatedStreams[peerId];
              return updatedStreams;
            });
          }
        });
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    }

    initLocalStream();

    return () => {
      socket.off("newPeer");
      socket.off("offer");
      socket.off("answer");
      socket.off("iceCandidate");
      socket.off("removePeer");

      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
    };
  }, [roomName]);

  async function createPeerConnection(peerId, isInitiator) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnections.current[peerId] = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          to: peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams((prevStreams) => ({
        ...prevStreams,
        [peerId]: event.streams[0],
      }));
    };

    localStreamRef.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current);
    });

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { to: peerId, offer: pc.localDescription });
    }
  }

  return { localStream: localStreamRef.current, remoteStreams };
}
