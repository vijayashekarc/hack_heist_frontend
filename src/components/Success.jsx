import React from "react";
import { useNavigate } from "react-router-dom";
import "./Success.css";

const Success = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-animation">
          <svg
            className="checkmark"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
          >
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path
              className="checkmark-check"
              fill="none"
              d="M14 27l7 7 17-17"
            />
          </svg>
        </div>
        <h1 className="success-title">Registration Successful!</h1>
        <p className="success-message">
          Your team has been successfully registered for the hackathon.  
          Get ready to hack the challenge! 🚀
        </p>
        <button className="success-btn" onClick={handleBackHome}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Success;
