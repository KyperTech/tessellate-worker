'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.index = index;
exports.zip = zip;

var _devshare = require('devshare');

var _devshare2 = _interopRequireDefault(_devshare);

var _jszip = require('jszip');

var _jszip2 = _interopRequireDefault(_jszip);

var _nodeSafeFilesaver = require('node-safe-filesaver');

var _nodeSafeFilesaver2 = _interopRequireDefault(_nodeSafeFilesaver);

var _lodash = require('lodash');

var _firepad = require('firepad');

var _firepad2 = _interopRequireDefault(_firepad);

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
    var zip = new _jszip2.default();
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
            zip.file(child.meta.path, text || '');
            resolve(text || '');
          });
        });
        promiseArray.push(promise);
      });
    };
    handleZip(directory);
    return Promise.all(promiseArray).then(function () {
      var content = zip.generate({ type: 'blob' });
      console.log('promises fulfilled', req.params.projectname + '-devShare-export.zip');
      var zipFile = _nodeSafeFilesaver2.default.saveAs(content, req.params.projectname + '-devShare-export.zip');
      console.log('zip file created', zipFile);
      res.send(zipFile);
    });
  });
}