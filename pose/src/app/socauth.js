import React, { useState } from "react";

// 주소 전환
const apiUrl = process.env.REACT_APP_API_BASE_URL;
const frontendUrl = process.env.REACT_APP_FRONTEND_BASE_URL;
const justUrl = process.env.REACT_APP_FRONTEND_just_UR; // url 리다이렉트

const Social = ({}) => {
  // Add provId and provider as props
  const [username, setUsername] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${apiUrl}/socauth/additional-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // @Needed to send a cookie within a request
          body: JSON.stringify({ username }), // Include provId and provider
        }
      );
      sessionStorage.setItem("userId", username); // 사용방법 : let userId = sessionStorage.getItem('userId');

      const result = await response.json();
      if (response.ok) {
        alert("Username added successfully!");
        window.location.href = `http://localhost:3002`; // Redirect to homepage or desired page
      } else if (response.status === 409) {
        alert(result.message); // Handle duplicate username error
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <React.Fragment>
      <div>
        <form id="usernameForm" onSubmit={handleSubmit}>
          <label htmlFor="username">Choose a Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </React.Fragment>
  );
};

export default Social;
