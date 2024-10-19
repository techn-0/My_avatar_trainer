import React from "react";
import { Dialog } from "@mui/material";
import LoginToggle from "./Login";

function LoginModal({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <LoginToggle onClose={onClose} />
    </Dialog>
  );
}

export default LoginModal;
