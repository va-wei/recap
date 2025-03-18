import React from "react";
import { useNavigate } from "react-router";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    
    navigate("/login");
  };

  return (
    <header className="header-container">
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
      <h1 className="header">recap.</h1>
    </header>
  );
};

export default Header;
