var gulp = require('gulp');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var through = require('through2');

var NAME = 'svgEdit';

function prefixStream(prefixText) {
  var stream = through();
  stream.write(prefixText);
  return stream;
}

function svgEdit(srcPath) {
  if (!srcPath) {
    throw new Error(NAME, 'Missing source path!');
  }
    // creating a stream through which each file will pass
  var stream = through.obj(function(file, encoding, cb) {
    // if (file.isBuffer()) {
    //   this.emit('error', new PluginError(NAME, 'Buffers not supported!'));
    //   return cb();
    // }

    if (file.isStream()) {
      // define the streamer that will transform the content
      var streamer = prefixStream(srcPath);
      // catch errors from the streamer and emit a gulp plugin error
      streamer.on('error', this.emit.bind(this, 'error'));
      // start the transformation
      console.log(file.inspect());
      file.contents = file.contents.pipe(streamer);
    }

    // make sure the file goes through the next gulp plugin
    this.push(file);
    // tell the stream engine that we are done with this file
    cb();
  });

  return stream;
}

gulp.src('./assets/svg/*.svg',{
    // buffer: false
  })
  .pipe(svgEdit("Hello world"))
  .pipe(gulp.dest("temp"));

svgEdit('hello world');

// exporting the plugin main function
// module.exports = svgEdit;