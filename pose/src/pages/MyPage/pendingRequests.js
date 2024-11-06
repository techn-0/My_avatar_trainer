import React from "react";
import ClearIcon from "@mui/icons-material/Clear";
import DoneIcon from "@mui/icons-material/Done";
import { Modal, Box, Typography, IconButton } from "@mui/material";
import { getToken } from "../login/AuthContext";

const apiUrl = process.env.REACT_APP_API_BASE_URL;
const frontendUrl = process.env.REACT_APP_FRONTEND_BASE_URL;

const PendingRequests = ({ pendingRequests = [], onRequestUpdate }) => {
  const currentUserId = sessionStorage.getItem("userId");
  const token = getToken();
  const userId = currentUserId;
  const friendUserId = pendingRequests[0].userId;

  const handleAccept = async () => {
    console.log("user Id: ", userId);
    console.log("friend user Id: ", friendUserId);
    const data = { userId, friendUserId };
    try {
      await fetch(`${apiUrl}/friends/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // JWT 토큰 추가
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      // 요청 목록 업데이트
      onRequestUpdate(friendUserId);
      alert("updated condition!");
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const handleDecline = async () => {
    console.log("user Id: ", userId);
    console.log("friend user Id: ", friendUserId);
    const data = { userId, friendUserId };
    try {
      await fetch(`${apiUrl}/friends/decline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // JWT 토큰 추가
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Failed to decline request:", error);
    }
  };

  return (
    <>
      {pendingRequests.length > 0 && (
        <Modal open={true}>
          <Box
            sx={{
              padding: 3,
              bgcolor: "background.paper",
              borderRadius: 1,
              width: 300,
              margin: "auto",
              mt: 5,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Pending Friend Requests
            </Typography>
            {pendingRequests.map((request) => (
              <Box
                key={request._id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="body1">
                  요청을 보낸 사용자: {request.userId}
                </Typography>
                <Box>
                  <IconButton onClick={handleAccept} color="primary">
                    <DoneIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDecline(request.userId)}
                    color="secondary"
                  >
                    <ClearIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Modal>
      )}
    </>
  );
};

export default PendingRequests;
