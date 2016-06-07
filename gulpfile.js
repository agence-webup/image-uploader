var gulp = require('gulp');
var browserSync = require('browser-sync');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var util = require('gulp-util');
var autoprefixer  = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var reload = browserSync.reload;

/**
 * CSS build
 */
gulp.task('css', function () {
    return gulp.src('src/uploader.css')
    .pipe(autoprefixer({
        browsers: ['> 1%', 'last 3 versions'],
        cascade: false
    }))
    .pipe(gulp.dest('dist'))
    .pipe(reload({stream:true}));
});

/**
 * CSS build + min
 */
gulp.task('css-min', function () {
    return gulp.src('src/uploader.css')
    .pipe(autoprefixer({
        browsers: ['> 1%', 'last 3 versions'],
        cascade: false
    }))
    .pipe(minifyCSS())
    .pipe(rename("uploader.min.css"))
    .pipe(gulp.dest('dist'))
    .pipe(reload({stream:true}));
});

/**
* JS build
*/
gulp.task('js', function(cb) {
    browserify('src/uploader.js', {
        standalone: 'ImageUploader',
    })
    .bundle()
    .pipe(source('uploader.js'))
    .pipe(gulp.dest('dist'));

    cb();
});

/**
* JS build + min
*/
gulp.task('js-min', function(cb) {
    browserify('src/uploader.js', {
        standalone: 'ImageUploader',
    })
    .bundle()
    .pipe(source('uploader.js'))
    .pipe(buffer())
    .pipe(uglify({
        mangle: true
    }))
    .pipe(rename("uploader.min.js"))
    .pipe(gulp.dest('dist'));

    cb();
});

/**
 * Copy sources to doc folder
 */
gulp.task('copy', ['css', 'css-min', 'js', 'js-min'], function () {
    return gulp.src(['dist/**/*'])
    .pipe(gulp.dest('doc/uploader'));
});

/**
 * Watch files for changes
 */
gulp.task('watch', function() {
    gulp.watch('src/**', ['copy']);
});

gulp.task('default', ['css', 'css-min', 'js', 'js-min']);
