'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.index = index;
exports.zip = zip;

var _devshare = require('devshare');

var _devshare2 = _interopRequireDefault(_devshare);

var _admZip = require('adm-zip');

var _admZip2 = _interopRequireDefault(_admZip);

var _lodash = require('lodash');

var _firepad = require('firepad');

var _firepad2 = _interopRequireDefault(_firepad);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * New project page
 */

function index(req, res) {
  res.json({ message: 'Success' });
}

function zip(req, res) {
  var fileSystem = _devshare2.default.project(req.params.owner, req.params.projectName).fileSystem;

  fileSystem.get().then(function (directory) {
    // console.log('directory loaded:', directory)
    var zip = new _admZip2.default();
    var promiseArray = [];
    var handleZip = function handleZip(fbChildren) {
      (0, _lodash.each)(fbChildren, function (child) {
        if (!child.meta || child.meta.entityType === 'folder') {
          delete child.meta;
          return handleZip(child);
        }
        console.log('child', child);
        if (child.original && !child.history) return zip.file(child.meta.path, child.original);
        var promise = new Promise(function (resolve) {
          return _firepad2.default.Headless(fileSystem.file(child.meta.path).firebaseRef()).getText(function (text) {
            console.log('file text', text);
            zip.addFile(child.meta.path, new Buffer(text));
            resolve(text || '');
          });
        });
        promiseArray.push(promise);
      });
    };
    handleZip(directory);
    return Promise.all(promiseArray).then(function () {
      zip.writeZip('./zips/test.zip');
      console.log('promises fulfilled', req.params.projectName + '-devShare-export.zip');
      // res.json({ message: 'zip created' })
      res.download('./zips/test.zip');
    });
  });
}