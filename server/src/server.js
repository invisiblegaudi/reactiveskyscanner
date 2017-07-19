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
      moment().format('YYYY-MM-DD'); // query validation: no historical searches
  
  let validate = ajv.compile(schema.search); // load query parameter validation rules
  var valid = validate(req.query);  // validate query
  if (!valid)
    return res.status(400).send(validate.errors);

  
  api.livePricing.search({
    ...req.query
  })
     .then(results => {
       let resultsRelational = results.Itineraries.map(Itinerary=>{
         let {OutboundLegId,InboundLegId,PricingOptions} = Itinerary;
         let priceLowestDetails = PricingOptions.reduce((a,b)=>a.Price<b.Price?a:b);
         let agent = results.Agents.find(agent=>agent.Id==priceLowestDetails.Agents[0]);
         let priceLowest = priceLowestDetails.Price;
         return {
           InboundLegId,
           OutboundLegId,
           PricingOptions,
           priceLowest,
           agent
         };
       }).map(Itinerary=>{
         let outbound,inbound;
         results.Legs.map(leg=>{
           leg.carrierDetails = leg.Carriers.map(carrierId=>results.Carriers.find(carrier=>carrier.Id===carrierId))[0]; 

           leg.originCity = results.Places.find(place=>place.Id===results.Places.find(place=>place.Id===leg.OriginStation).ParentId);
           leg.destinationCity = results.Places.find(place=>place.Id===results.Places.find(place=>place.Id===leg.DestinationStation).ParentId);

           let durationHrs = moment.duration(leg.Duration, 'minutes').asHours();
           leg.durationHrs = moment(durationHrs, 'hours').format("h mm");
           
           if(leg.Id===Itinerary.OutboundLegId) {
             outbound = leg;
           } else if(leg.Id===Itinerary.InboundLegId) {
             inbound = leg;
           }
         })
         return {...Itinerary,leg:{inbound,outbound}}
       }).map(Itinerary=>{
         Itinerary.leg.outbound.segments = Itinerary.leg.inbound.segments = [];
         results.Segments.forEach(segment=>{
           let matchingSegmentIndex = Itinerary.leg.outbound.SegmentIds.indexOf(segment.Id);
           if(matchingSegmentIndex>=0) {
             Itinerary.leg.outbound.segments.push(segment); 
           } else {
             matchingSegmentIndex = Itinerary.leg.inbound.SegmentIds.indexOf(segment.Id);
             if(matchingSegmentIndex>=0)
               Itinerary.leg.inbound.segments.push(segment); 
           }
         })
         return Itinerary;
       });
       return res.json({resultsRelational,query:results.Query});
     })
     .catch(e=>{
       let err = process.env.NODE_ENV === 'test' ||
                 process.env.NODE_ENV === 'development' ?
                 {error:e.message} : 'internal server error';

       return res.status(500).send(err);
     });
});

module.exports = { app: app.listen(4000, () => {
  console.log('Node server listening on http://localhost:4000');
},), api};

