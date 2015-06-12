var _ = require('underscore');

module.exports = function(cheerio) {

  cheerio.prototype.svgSize = function(settings) {
    if (!settings) return this;

    // Collection the exisiting svg dimensions
    var svg = {
      height: this.attr('height'),
      width: this.attr('width')
    };
    var newDimensions = _.pick(settings, ['height', 'width']);

    if (newDimensions.height) {
      newDimensions.width = (newDimensions.height/svg.height) * svg.width;
    }
    if (newDimensions.width) {
      newDimensions.height = (newDimensions.width/svg.width) * svg.height;
    }

    this.attr(newDimensions);
  }

  cheerio.prototype.svgColor = function(color) {
    if (!color) return this;

    this.find('[fill]')
      .attr('fill', color);
  }

  return cheerio;

};