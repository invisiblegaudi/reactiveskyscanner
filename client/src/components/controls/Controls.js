import React from 'react';

const Controls = () => (
    <div className="Controls row">    
    <a className="col-xs-2 text-center">Filter</a>
    <a className="col-xs-2 text-center">Sort</a>
    <span className="col-xs-5 col-xs-offset-3" id="price-alerts">
    <i className="glyphicon glyphicon-bell"></i><a class="text">Price Alerts</a></span>
    </div>
)

export default Controls;