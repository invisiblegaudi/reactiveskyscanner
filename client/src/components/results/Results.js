import React from 'react';
import './Results.scss';

let logoSrc = 'https://www.glooby.com/images/airline/momondo/u2.png?216';

const Logo = () => (
    <div className="col-xs-1">
    <img className="airline-logo" src={logoSrc} alt="airline logo"/>
    </div>
)

const Journey = () => (
    <div className="journey col-xs-12">
    <div className="row">
    <Logo />
    <div className="col-xs-2">
    <span className="departure time">07:00</span><br/>
    <span className="arrival country-code">EDI</span>
    </div>
    <div className="col-xs-1 arrow"><i className="glyphicon glyphicon-arrow-right"></i></div>
    <div className="col-xs-1">
    <span className="arrival time">08:30</span><br />
    <span className="arrival country-code">LON</span>
    </div>
    <div className="col-xs-3 col-xs-offset-3 summary"><span className="duration">1h 30</span><br /><span className="flight-type">Direct</span></div>
    </div>
    </div>
);

const Result = () => (
    <div className="result row">
    <Journey/>
    <Journey/>
    <div className="row bottom">
    <div className="col-xs-6">
    <h3 className="price-total">£98</h3>
    <h5 className="seller">omegaflightstore.com</h5>
    </div>
    <div className="col-xs-3  col-xs-offset-2 "><button type="button" className="select">Select</button></div>
    </div>
    </div>
);

const Results = () => (
    <div className="Results">
    <Result/>
    <Result/>
    <Result/>
    <Result/>
    <Result/>
    <Result/>
    </div>
);

export default Results;
