import React, { useState } from "react";

const Comment = ({ ownerId, userId }) => {
  const [content, setContent] = useState("");

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleSubmit = async () => {
    if (!content) {
      alert("내용 입력해주세요.");
      return;
    }

    const data = {
      date: new Date().toISOString(),
      authorId: userId,
      content,
      ownerId,
    };

    try {
      const response = await fetch("/myPage/addComment", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // JWT 토큰
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("코멘트가 작성되었습니다.");
        setContent(""); // 성공 시 입력 필드 초기화
      } else {
        alert("코멘트 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <h2>코멘트</h2>
      <input
        type="text"
        placeholder="내용 입력하시오"
        style={{ width: "400px", height: "50px" }}
        value={content}
        onChange={handleContentChange}
      />
      <button
        className="submitComment"
        type="button"
        style={{ width: "100px", height: "50px", padding: "10px" }}
        onClick={handleSubmit}
      >
        submit
      </button>
    </div>
  );
};

export default Comment;
