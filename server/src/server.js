require('isomorphic-fetch');
require('es6-promise').polyfill();

const fs = require('fs'),
      express = require('express'),
      app = express(),
      api = require('./api/'),
      Ajv = require('ajv'),
      moment = require('moment');

const ajv = new Ajv();
const schema = { search: JSON.parse(fs.readFileSync('./server/src/schema/search.json','utf8')) }

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/search', (req, res) => {

  schema.search.properties.fromDate.formatMinimum =
    schema.search.properties.toDate.formatMinimum =
      moment().format('YYYY-MM-DD'); // validaton: no historical searches
  
  let validate = ajv.compile(schema.search); // load query parameter validation rules
  var valid = validate(req.query);  // validate query
  if (!valid)
    return res.status(400).send(validate.errors);

  
  api.livePricing.search({
    ...req.query
  }).then(results => {

    // add relational elements to Legs
    let Legs = results.Legs.map(leg=>{
      
      leg.carrierDetails = leg.Carriers.map(carrierId=>results.Carriers.find(carrier=>carrier.Id===carrierId))[0]; //associate first carrier
      leg.originCity = results.Places.find(place=>place.Id===results.Places.find(place=>place.Id===leg.OriginStation).ParentId); // associate place to origin parent id (country)  
      leg.destinationCity = results.Places.find(place=>place.Id===results.Places.find(place=>place.Id===leg.DestinationStation).ParentId); // associate place to destination parent id (country) 

      // format duration time
      let durationHrs = moment.duration(leg.Duration, 'hours');
      leg.durationHrs = (durationHrs.hours()?durationHrs.hours()+'h ':'')
                      + durationHrs.minutes()+'m';

      // associate segments to leg segment ids
      leg.segments = leg.SegmentIds.map(segmentId=>{
        results.Segments.find(segment=>segmentId===segment.Id);
      })
      
      return leg;
    });


    // build relational query results
    let resultsRelational = results.Itineraries.map(Itinerary=>{
      let {OutboundLegId,InboundLegId,PricingOptions} = Itinerary; // return ids for unique result keys
      let priceLowestDetails = PricingOptions.reduce((a,b)=>a.Price<b.Price?a:b); // calculate lowest price for listing
      let agent = results.Agents.find(agent=>agent.Id==priceLowestDetails.Agents[0]); //  associate agent with the lowest price
      let priceLowest = priceLowestDetails.Price; // now get price string only
      return {
        InboundLegId,
        OutboundLegId,
        PricingOptions,
        priceLowest,
        agent,
        leg:{
          inbound:Legs.find(leg=>leg.Id===InboundLegId), // associate leg for inbound journey 
          outbound:Legs.find(leg=>leg.Id===OutboundLegId) // associate leg for outbound journey
        }
      };
    })

    // return query for search results header
    let query = {
      origin:results.Places.find(place=>place.Id===parseInt(results.Query.OriginPlace)).Code, // associate place code with query origin
      destination:results.Places.find(place=>place.Id===parseInt(results.Query.DestinationPlace)).Code, // associate place code with query origin
      travellers:results.Query.Children+results.Query.Adults, // calculate total number of travellers
      cabinClass:results.Query.CabinClass.toLowerCase() // convert class to lowercase
    }
    
    return res.json({results:resultsRelational,query});
  }).catch(e=>{
    let err = process.env.NODE_ENV === 'test' ||
              process.env.NODE_ENV === 'development' ?
              {error:e.message} : 'internal server error';

    return res.status(500).send(err);
  });
});

module.exports = { app: app.listen(4000, () => {
  console.log('Node server listening on http://localhost:4000');
},), api};

