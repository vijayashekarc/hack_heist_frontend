import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="home-bg">
      <div className="home-overlay" />
      <div className="home-content">
        <h1 className="home-title">Welcome to Hackathon Heist</h1>
        <p className="home-sub">Plan your team, heist the challenge, and win!</p>
        <button onClick={goToRegister} className="home-btn">
          Go to Registration
        </button>
      </div>
      <footer className="home-footer">
        <span>“No plan survives first contact—except a solid registration.”</span>
      </footer>
    </div>
  );
};

export default Home;

