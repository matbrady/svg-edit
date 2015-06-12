var _          = require('underscore');
var async      = require('async');
var cheerio    = require('cheerio');
var cheerioSvg = require('./lib/cheerio-svg.js')(cheerio);
var fs         = require('fs-extra');
var glob       = require('glob');
var path       = require('path');

var svgEdit = {
  colorize: true
};

svgEdit.edit = function(filePath, destPath, config) {
  console.log(filePath);
};

function getColorHex(color) {
  if (_.isObject(color)) {
    return color.hex;
  }
  else {
    return color;
  }
}

function getColorName(color) {
  if (_.isObject(color)) {
    return color.name;
  }
  else {
    // return color.substr(1, color.length);
    return color;
  }
}

svgEdit.change = function(params, cb) {
  var _this = this;
  try {
    this.validateConfig(params);
  }
  catch(err) {
    throw err;
  }

  var outputFolder = params.outputFolder;
  var svgModJSON   = params.options;

  // Collect all svg file names
  glob(path.join(params.inputFolder + '/**/*.svg'), function(err, files){

    if (err) throw new Error(err);

    // Read each SVG file
    async.each(files, function(filePath, cb) {

      var fileName = path.basename(filePath);
      var baseName = path.basename(filePath, '.svg');
      var ext      = path.extname(filePath);
      var destPath = path.join(outputFolder, fileName);
      var destBase = path.join(outputFolder, baseName);

      // IF svg data object exists
      // ex: SVG_NAME: { width: 500 }
      // ELSE copy file directly to the output folder
      // console.log(baseName, !_.has(svgModJSON, baseName));
      if (_.has(svgModJSON, baseName)) {

        fs.readFile(filePath, 'utf-8', function(err, markup) {
          if (err) throw new Error(err);

          var $ = cheerio.load(markup, {
            // normalizeWhitespace: true,
            xmlMode: true
          }); 
          svgData = svgModJSON[baseName];

          if (_.isArray(svgData)) {
            // Loop through each data object
            async.each(svgData, function(data, writeCb) {
              var newBaseFileName = baseName;

              if (data.height || data.width) {
                $('svg').svgSize(data);
                // Update destination path to reflect size modifications
                if (data.height) newBaseFileName += ('--h'+data.height); // Ex: SVG_NAME--h200
                if (data.width) newBaseFileName += ('--w'+data.width); // Ex: SVG_NAME--w200
              }
              if (data.color) {
                $('svg').svgColor(getColorHex(data.color));
                // Update destination path to reflect color modification
                newBaseFileName += ('--'+getColorName(data.color)); // Ex: SVG_NAME--red
              }

              fs.outputFile(path.join(outputFolder, (newBaseFileName + ext)), $.html(), function(err, written) {
                if (err) throw new Error(err);
                writeCb();
              });

            }, function() {
              // Copy the original file 
              fs.copy(filePath, destPath, function(err) {
                if (err) throw new Error(err);
                cb();
              });
            });
          }
          else {
            var data = svgData;
            // Create new svg based on the svgData Object
            var newBaseFileName = baseName;

            if (data.height || data.width) {
              $('svg').svgSize(data);
              // Update destination path to reflect size modifications
              if (data.height) newBaseFileName += ('--h'+data.height); // Ex: SVG_NAME--h200
              if (data.width) newBaseFileName += ('--w'+data.width); // Ex: SVG_NAME--w200
            }
            if (data.color) {
              $('svg').svgColor(getColorHex(data.color));
              // Update destination path to reflect color modification
              newBaseFileName += ('--'+getColorName(data.color)); // Ex: SVG_NAME--red
            }

            fs.outputFile(path.join(outputFolder, (newBaseFileName + ext)), $.html(), function(err, written) {
              if (err) throw new Error(err);
              cb();
            });
          }
        });
      }
      else {
        // TODO: CHECK FOR COLORIZE
        fs.copy(filePath, destPath, function(err) {
          if (err) throw new Error(err);
          cb();
        });
      }
    }, function(results) {
      !!cb && cb();
    });
  });
};

svgEdit.validateConfig = function(params) {
  var params = params || {};
  var requiredConfigKeys = [
    'inputFolder',
    'outputFolder',
    'options'
  ];
  requiredConfigKeys.forEach(function(val, index, array) {
    var hasKey = _.has(params, val);
    if (!hasKey) {
      throw new Error(val + ' is not defined');
    }
  });
};

module.exports = svgEdit;

