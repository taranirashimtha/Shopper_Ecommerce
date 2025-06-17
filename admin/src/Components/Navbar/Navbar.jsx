import React from 'react';
import './Navbar.css';
import navlogo from "../../assets/nav-logo.svg";
import navProfile from "../../assets/nav-profile.svg";


const Navbar = () => {
  return (
    <div className='navbar'>
      <img src={navlogo} alt="Logo" />
      <img src={navProfile} alt="Profile" />

    </div>
  );
};

export default Navbar;