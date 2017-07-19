import React, { Component } from 'react';
import './App.scss';
import Rx from 'rx-lite';
import moment from 'moment';

import TopNav from './components/topnav';
import Controls from './components/controls';
import Header from './components/header';
import Results from './components/results';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {results:[]}        
  }
  
  componentWillMount() {
    
    let  fromDate = moment().add(1,'months').format('YYYY-MM-DD');
    let  toDate = moment().add(2,'months').format('YYYY-MM-DD');

    const getFlights = (outboundDate,inboundDate) =>
      fetch(`http://localhost:4000/api/search?fromPlace=edi&toPlace=syd&fromDate=${outboundDate}&toDate=${inboundDate}&class=Economy`)
        .then(res => res.json())
        .catch(err => console.error);

    Rx.Observable.fromPromise(getFlights(fromDate,toDate))
      .forEach(search=>this.setState({results:search.results,query:search.query}));
    
  };

  render() {
      console.log(this.state.results);
    return (
      <div className="App container-fluid">
      <TopNav/>
	     <Header/>
	     <Controls/>
	     <Results flights={this.state.results}/>
      </div>
    );
  }
}


export default App;
