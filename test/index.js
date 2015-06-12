var chai           = require('chai');
var should         = require('chai').should();
var expect         = require('chai').expect;
var svgEdit        = require('../index.js');
var variationsJSON = require('./variations.json');

chai.use(require('chai-fs'));

describe('svgEdit', function() {

  before(function(done) {
    svgEdit.change({
      inputFolder: "./assets/svg",
      outputFolder: "./assets/temp",
      options: variationsJSON
    }, done);
  });

  it('should have a "change" function', function() {
    expect(svgEdit.change).to.exist;
  });

  it('should Throw Error when passed an no config object', function() {
    expect(function() {
      svgEdit.change();
    }).to.throw('inputFolder is not defined');
  });

  it('created an svg', function() {
    expect("./assets/temp/pacman.svg").to.be.a.file().and.not.empty;
  });
});