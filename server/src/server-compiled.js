'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

require('isomorphic-fetch');
require('es6-promise').polyfill();

var fs = require('fs'),
    express = require('express'),
    app = express(),
    api = require('./api/'),
    Ajv = require('ajv'),
    moment = require('moment');

var ajv = new Ajv();
var schema = { search: JSON.parse(fs.readFileSync('./server/src/schema/search.json', 'utf8')) };

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/api/search', function (req, res) {

  schema.search.properties.fromDate.formatMinimum = schema.search.properties.toDate.formatMinimum = moment().format('YYYY-MM-DD'); // no historical searches

  var validate = ajv.compile(schema.search);
  var valid = validate(req.query);
  if (!valid) return res.status(400).send(validate.errors);

  api.livePricing.search(_extends({}, req.query)).then(function (results) {
    var resultsRelational = results.Itineraries.map(function (Itinerary) {
      var OutboundLegId = Itinerary.OutboundLegId,
          InboundLegId = Itinerary.InboundLegId,
          PricingOptions = Itinerary.PricingOptions;

      var priceLowestDetails = PricingOptions.reduce(function (a, b) {
        return a.Price < b.Price ? a : b;
      });
      var agent = results.Agents.find(function (agent) {
        return agent.Id == priceLowestDetails.Agents[0];
      });
      var priceLowest = priceLowestDetails.Price;
      return {
        InboundLegId: InboundLegId,
        OutboundLegId: OutboundLegId,
        PricingOptions: PricingOptions,
        priceLowest: priceLowest,
        agent: agent
      };
    }).map(function (Itinerary) {
      var outbound = void 0,
          inbound = void 0;
      results.Legs.map(function (leg) {
        leg.carrierDetails = leg.Carriers.map(function (carrierId) {
          return results.Carriers.find(function (carrier) {
            return carrier.Id === carrierId;
          });
        })[0];

        leg.originCity = results.Places.find(function (place) {
          return place.Id === results.Places.find(function (place) {
            return place.Id === leg.OriginStation;
          }).ParentId;
        });
        leg.destinationCity = results.Places.find(function (place) {
          return place.Id === results.Places.find(function (place) {
            return place.Id === leg.DestinationStation;
          }).ParentId;
        });

        var durationHrs = moment.duration(leg.Duration, 'minutes').asHours();
        leg.durationHrs = moment(durationHrs, 'hours').format("h mm");

        if (leg.Id === Itinerary.OutboundLegId) {
          outbound = leg;
        } else if (leg.Id === Itinerary.InboundLegId) {
          inbound = leg;
        }
      });
      return _extends({}, Itinerary, { leg: { inbound: inbound, outbound: outbound } });
    }).map(function (Itinerary) {
      Itinerary.leg.outbound.segments = Itinerary.leg.inbound.segments = [];
      results.Segments.forEach(function (segment) {
        var matchingSegmentIndex = Itinerary.leg.outbound.SegmentIds.indexOf(segment.Id);
        if (matchingSegmentIndex >= 0) {
          Itinerary.leg.outbound.segments.push(segment);
        } else {
          matchingSegmentIndex = Itinerary.leg.inbound.SegmentIds.indexOf(segment.Id);
          if (matchingSegmentIndex >= 0) Itinerary.leg.inbound.segments.push(segment);
        }
      });
      return Itinerary;
    });
    return res.json(resultsRelational);
  }).catch(function (e) {
    var err = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' ? { error: e.message } : 'internal server error';

    return res.status(500).send(err);
  });
});

module.exports = { app: app.listen(4000, function () {
    console.log('Node server listening on http://localhost:4000');
  }), api: api };
