const sinon = require('sinon'),
      mockResults = require('../../test/__mocks/results.json'),
      server = require('./server-compiled.js');

const app = server.app, api = server.api;
api.livePricing.search = sinon.stub();
api.livePricing.search.returns(Promise.resolve(mockResults))
