import React,{Component} from 'react';
import './Header.scss';

class Header extends Component {

  render() {
    return (
      <div id="results-header"><h1>
      <span id="origin">{this.props.query.origin}</span><span id="destination"><i className="glyphicon glyphicon-arrow-right"></i>{this.props.query.destination}</span></h1>
      <h5 id="details">{this.props.query.travellers} travellers, {this.props.query.cabinClass}</h5>
      </div>
    );
    
  }
  
} 

export default Header;
