import React from "react";
import { useNavigate } from "react-router";

interface HeaderProps {
  setAuthToken: React.Dispatch<React.SetStateAction<string | null>>;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
}

const Header: React.FC<HeaderProps> = ({ setAuthToken, setUserId }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setAuthToken(null);
    setUserId(null);
    
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
