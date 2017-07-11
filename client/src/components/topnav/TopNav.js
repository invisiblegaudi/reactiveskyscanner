import React from 'react';
import './TopNav.scss';
import logo from '../..//logo.svg';

const TopNav = () => (
  <header className='header'>
    <a href="/">
      <span className='logoText'>Skyscanner</span>
      <img className='logo' alt="Skyscanner" src={logo}/>
    </a>
    <a href="#" className='glyphicon glyphicon-menu-hamburger'></a>
  </header>
);

export default TopNav;
