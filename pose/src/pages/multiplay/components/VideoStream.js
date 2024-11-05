// src/components/VideoStream.js
import React, { useRef, useEffect } from "react";
import useWebRTC from "../hooks/useWebRTC";
import "./VideoStream.css";

function VideoStream({ roomName }) {
  const { localStream, remoteStreams } = useWebRTC(roomName);
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    Object.entries(remoteStreams).forEach(([peerId, stream]) => {
      if (remoteVideoRefs.current[peerId] && stream) {
        remoteVideoRefs.current[peerId].srcObject = stream;
      }
    });
  }, [remoteStreams]);

  return (
    <div className="video-stream">
      <video
        ref={localVideoRef}
        autoPlay
        muted
        className="local-video"
      />
      {Object.entries(remoteStreams).map(([peerId, stream]) => (
        <video
          key={peerId}
          ref={(ref) => (remoteVideoRefs.current[peerId] = ref)}
          autoPlay
          className="remote-video"
        />
      ))}
    </div>
  );
}

export default VideoStream;