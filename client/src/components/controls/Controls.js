import React from 'react';
import './Controls.scss';

const Controls = () => (
  <div className="Controls row">    
  <a className="col-xs-2 text-center">Filter</a>
  <a className="col-xs-2 text-center">Sort</a>
  <span className="col-xs-6 col-xs-offset-2" id="price-alerts">
  <i className="glyphicon glyphicon-bell"></i><a className="text">Price Alerts</a>
  </span>
  </div>
)

export default Controls;
