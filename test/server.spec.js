const chai = require('chai'),
      chaiHttp = require('chai-http'),
      should = chai.should(),
      fs = require('fs'),
      moment = require('moment'),
      sinon = require('sinon'),
      mockResults = require('./__mocks/results.json'),
      mockQueryParsed = require('./__mocks/searchQuery.json'),
      mockResultsParsed = require('./__mocks/resultsParsed.json');


process.env.NODE_ENV = 'test';

it('can start the server and get a response', function(done) {

  const app = require('../server/src/server').app;
  
  chai.use(chaiHttp);
  chai.request(app)
	     .get('/')
	     .end(function(err, res) {
	       res.should.have.status(200);
	       res.text.should.equal('Hello World!');
	       app.close();
	       done();
	     });
}) ;

it('connects to the api and gets a validation error', function(done) {

  const app = require('../server/src/server').app;
  
  chai.use(chaiHttp);
  chai.request(app)
	     .get('/api/search')
	     .end( async function(err, res) {
	       res.should.have.status(400);
	       let validationError = JSON.parse(res.text)[0];
	       validationError.keyword.should.equal('required');
        let searchSchema = await JSON.parse(fs.readFileSync('server/src/schema/search.json','utf8'));
        validationError.params.missingProperty.should.equal(searchSchema.required[0]);
	       app.close();
	       done();
	     });
});

it('connects to the api and gets results', function(done) {
  this.timeout(60000);
  const server = require('../server/src/server');
  const app = server.app, api = server.api;
  api.livePricing.search = sinon.stub();
  api.livePricing.search.returns(Promise.resolve(mockResults))
  let  outboundDate = moment().add(1,'months').format('YYYY-MM-DD');
  let  inboundDate = moment().add(2,'months').format('YYYY-MM-DD');
  chai.use(chaiHttp);
  chai.request(app)
 	    .get(`/api/search?fromPlace=edi&toPlace=syd&fromDate=${outboundDate}&toDate=${inboundDate}&class=Economy`)
 	    .then(res=> {
 	      res.should.have.status(200);
        res.body.should.not.be.empty;
        res.body.results.length.should.equal(445);
        res.body.results.should.deep.equal(mockResultsParsed);
        res.body.query.should.deep.equal(mockQueryParsed);
        res.body.results[444].leg.outbound.segments.length.should.equal(3);
 	      app.close();
        done();
 	    })
      .catch(e=>{
        console.error(e);
      });
});
