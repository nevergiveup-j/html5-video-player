var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var connect = require("gulp-connect");

gulp.task('server', function() {
  connect.server({
    port: 8088,
    livereload: true
  });
});

gulp.task('watch', function() {

})

gulp.task('compress', function() {
  return gulp.src('zepto.refresh.js')
    .pipe(uglify())
    .pipe(rename({
        extname: '.min.js'
    }))
    .pipe(gulp.dest('.'));
});


gulp.task('default', function() {
  // place code for your default task here
});