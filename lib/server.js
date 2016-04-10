'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var port = process.env.PORT || 3000; /**
                                      * Module dependencies
                                      */

var app = (0, _express2.default)();

/**
 * Expose
 */

exports.default = app;

// Bootstrap routes

require('./config/express')(app);
require('./config/routes')(app);

listen();
function listen() {
  if (app.get('env') === 'test') return;
  app.listen(port);
  var startMsg = 'Server started\nport: ' + port + '\n';
  console.log(startMsg);
}