'use strict';

/*!
 * Module dependencies.
 */

var _home = require('../app/controllers/home');

var home = _interopRequireWildcard(_home);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Expose routes
 */

module.exports = function (app) {
  app.get('/', home.index);
  app.get('/projects/:owner/:projectName/zip', home.zip);

  /**
   * Error handling
   */

  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message && (~err.message.indexOf('not found') || ~err.message.indexOf('Cast to ObjectId failed'))) {
      return next();
    }

    console.error(err.stack);

    if (err.stack.includes('ValidationError')) {
      res.status(422).render('422', { error: err.stack });
      return;
    }

    // error page
    // res.status(500).render('500', { error: err.stack })

    // 500 Response
    res.status(500).json({
      message: 'Error.',
      stack: err.stack,
      code: 500
    });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res) {
    res.status(404).json({
      message: 'Invalid request.',
      status: 'NOT_FOUND',
      code: 404
    });
  });
};