import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedButton = ({
  children,
  destination,
  className = "",
  style = {},
  title = "",
}) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate("/register", {
        state: {
          redirectTo: destination,
        },
      });
      return;
    }

    navigate(destination);
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      style={{
        cursor: "pointer",
        fontFamily: "inherit",
        ...style,
      }}
      title={title}
    >
      {children}
    </button>
  );
};

export default ProtectedButton;
