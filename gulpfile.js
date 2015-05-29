'use strict';

var gulp       = require('gulp');
var del        = require('del');
var path       = require('path');
var browserify = require('browserify');
var reactify   = require('reactify');
var watchify   = require('watchify');
var source     = require('vinyl-source-stream');
var $          = require('gulp-load-plugins')();

var prod = $.util.env.prod;

// gulp-plumber for error handling
function onError() {
    /* jshint ignore:start */
    var args = Array.prototype.slice.call(arguments);
    $.util.beep();
    $.notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
    }).apply(this, args);
    this.emit('end'); // Keep gulp from hanging on this task
    /* jshint ignore:end */
}


// Styles
gulp.task('styles', function() {
    return gulp.src('src/styles/**/*')
        .pipe($.plumber({
            errorHandler: onError
        }))
        .pipe($.concat('main.scss'))
        .pipe($.rubySass({
            style: 'compressed',
            precision: 10,
            loadPath: ['src/bower_components']
        }))
        .pipe($.autoprefixer('last 3 versions'))
        .pipe(gulp.dest('dist/styles'))
        .pipe($.size());
});


// Scripts
gulp.task('scripts', function() {
    var bundler;
    bundler = browserify({
        basedir: __dirname,
        noparse: ['react/addons', 'reflux', 'fastclick', 'react-router'],
        entries: ['./src/scripts/app.js'],
        transform: [reactify],
        extensions: ['.js'],
        debug: true,
        cache: {},
        packageCache: {},
        fullPaths: true
    });

    bundler = watchify(bundler);

    function rebundle() {
        console.log('Bundling Scripts...');
        var start = Date.now();
        return bundler.bundle()
            .on('error', onError)
            .pipe(source('app.js'))
            .pipe(prod ? $.streamify($.uglify()) : $.util.noop())
            .pipe(gulp.dest('dist/scripts'))
            .pipe($.notify(function() {
                console.log('Bundling Complete - ' + (Date.now() - start) + 'ms');
            }));
    }

    bundler.on('update', rebundle);

    return rebundle();
});

// Images
gulp.task('images', function() {
    return gulp.src('src/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});


// Webserver
gulp.task('serve', function() {
  gulp.src('dist')
      .pipe($.webserver({
          livereload: true,
          port: 9000,
          fallback: 'index.html'
      }));
});

// HTML
gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

// Clean
gulp.task('clean', function(cb) {
    del(['dist/styles', 'dist/scripts', 'dist/images'], cb);
});


// Default task
gulp.task('default', ['clean', 'html', 'styles', 'scripts']);


// Watch
gulp.task('watch', ['html', 'styles', 'scripts', 'serve'], function() {
    gulp.watch('src/*.html', ['html']);
    gulp.watch('src/styles/**/*.scss', ['styles']);
    gulp.watch('src/images/**/*', ['images']);
});
