import React from 'react';
import './Header.scss';

const Header = () => (
    <div id="results-header"><h1>
    <span id="origin">EDI</span><span id="destination"><i className="glyphicon glyphicon-arrow-right"></i>LON</span></h1>
    <h5 id="details">2 travellers, economy</h5>
    </div>
);

export default Header;
