import React from "react";
import "./Header.css";

const Header = ({ title }) => {
  return (
    <div className="header">
      <h2>{title}</h2>
    </div>
  );
};

export default Header;
