const chai = require('chai'),
      chaiHttp = require('chai-http'),
      should = chai.should(),
      fs = require('fs');


process.env.APIKEY = 'ss630745725358065467897349852985';

it('can start the server and get a response', function(done) {

  const app = require('../server/src/server');
  
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

  const app = require('../server/src/server');
  
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

  const app = require('../server/src/server');
  let od = new Date();
  let  OutboundDate = `${od.getYear()}-${od.getMonth()}-${od.getDay()}`
  
  chai.use(chaiHttp);
  chai.request(app)
	     .get('/api/search?OriginPlace=edi&DestinationPlace=lon&OutboundDate=${OutboundDate}&CabinClass=Economy')
	     .end( async function(err, res) {
	       res.should.have.status(200);
        res.body.should.be.json();
	       app.close();
	       done();
	     });
});
