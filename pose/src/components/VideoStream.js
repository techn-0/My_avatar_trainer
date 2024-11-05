import React, { useRef, useEffect } from "react";
import useWebRTC from "../hooks/useWebRTC";
import "./VideoStream.css";

function VideoStream({ roomName }) {
  const { localStreamRef, remoteStream } = useWebRTC(roomName);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStreamRef, remoteStream]);

  return (
    <div className="video-stream">
      <video ref={localVideoRef} autoPlay muted className="local-video" />
      {remoteStream ? (
        <video ref={remoteVideoRef} autoPlay className="remote-video" />
      ) : (
        <p>No remote video stream available</p>
      )}
    </div>
  );
}

export default VideoStream;
