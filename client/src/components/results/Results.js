import React, { Component } from 'react';
import './Results.scss';
import moment from 'moment';

class Logo extends Component {
  render() {
    return(
      <div className="col-xs-1">
      <img className="airline-logo" src={this.props.src} alt={this.props.alt} />
      </div>
    );
  }
}

class Journey extends Component {

  render() {
    return(
    <div className="journey col-xs-12">
    <div className="row">
    <Logo src={this.props.logoSrc} alt={this.props.carrier}/>
    <div className="col-xs-2">
    <span className="departure time">{this.props.departure}</span><br/>
    <span className="arrival country-code">{this.props.origin}</span>
    </div>
    <div className="col-xs-1 arrow"><i className="glyphicon glyphicon-arrow-right"></i></div>
    <div className="col-xs-1">
    <span className="arrival time">{this.props.arrival}</span><br />
    <span className="arrival country-code">{this.props.destination}</span>
    </div>
    <div className="col-xs-3 col-xs-offset-3 summary"><span className="duration">{this.props.duration}</span><br /><span className="flight-type">{this.props.stops.length?`Stops: ${this.props.stops.length}`:'Direct'}</span></div>
    </div>
    </div>

    )
  }
}

class Result extends Component {

  render() {

    const flight = this.props.flight;
    const outbound = this.props.flight.leg.outbound;
    const inbound = this.props.flight.leg.inbound;
//    console.log(flight)
    return (
      <div className="result row" key={flight.OutboundLegId+flight.InboundLegId}>
      <Journey
      stops={outbound.Stops}
      logoSrc={outbound.carrierDetails.ImageUrl}
      carrier={outbound.carrierDetails.Name}
      origin={outbound.originCity.Code}
      destination={outbound.destinationCity.Code}
      duration={outbound.durationHrs}
      departure={moment(outbound.Departure).format('HH:MM')}
      arrival={moment(outbound.Arrival).format('HH:MM')}
      />
      <Journey
      stops={inbound.Stops}
      logoSrc={inbound.carrierDetails.ImageUrl}
      carrier={inbound.carrierDetails.Name}
      origin={inbound.originCity.Code}
      destination={inbound.destinationCity.Code}
      duration={inbound.durationHrs}
      departure={moment(outbound.Departure).format('HH:MM')}
      arrival={moment(outbound.Arrival).format('HH:MM')}
      />
      <div className="row bottom">
      <div className="col-xs-6">
      <h3 className="price-total">£{Math.round(flight.priceLowest)}</h3>
      <h5 className="seller">{flight.agent.Name}</h5>
      </div>
      <div className="col-xs-3  col-xs-offset-2 "><button type="button" className="select">Select</button></div>
      </div>
      </div>
    );  
  }

  
}

class Results extends Component {

  render() {
    
    let errorNoResults = 'There were no results available, please try another search or check your network settings';

    let resultList = this.props.flights ?
                     this.props.flights.map((flight,i)=>{      
                       return <Result flight={flight} key={i}/>
                     }) : <span className="message">{errorNoResults}</span>
    
    return (
      <div className="Results">
      {resultList}
      </div>
    )
  }

}


export default Results;
