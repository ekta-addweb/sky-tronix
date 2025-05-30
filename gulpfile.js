"use strict";

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass')); // Add this line
const del = require('del');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const htmlreplace = require('gulp-html-replace');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();

// Clean task
gulp.task('clean', function () {
  return del(['dist', 'assets/css/app.css']);
});

// Compile SCSS(SASS) files
gulp.task('scss', function compileScss() {
  return gulp.src(['./assets/scss/*.scss'])
    .pipe(sass.sync({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('./assets/css'));
});

// Minify CSS
gulp.task('css:minify', gulp.series('scss', function cssMinify() {
  return gulp.src("./assets/css/*.css")
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(browserSync.stream());
}));

// Minify Js
gulp.task('js:minify', function () {
  return gulp.src([
    './assets/js/custom.js'
  ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/assets/js'))
    .pipe(browserSync.stream());
});

// Replace HTML block for Js and Css file to min version upon build and copy to /dist
gulp.task('replaceHtmlBlock', function () {
  return gulp.src(['*.html'])
    .pipe(htmlreplace({
      'js': 'assets/js/*.js',
      'css': 'assets/css/app.min.css'
    }))
    .pipe(gulp.dest('dist/'));
});

// Configure the browserSync task and watch file path for change
gulp.task('dev', function browserDev(done) {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
  gulp.watch(['assets/scss/*.scss'], gulp.series('css:minify', function cssBrowserReload(done) {
    browserSync.reload();
    done(); //Async callback for completion.
  }));
  gulp.watch('assets/js/*.js', gulp.series('js:minify', function jsBrowserReload(done) {
    browserSync.reload();
    done();
  }));
  gulp.watch(['*.html']).on('change', browserSync.reload);
  done();
});

// Build task
gulp.task("build", gulp.series(gulp.parallel('css:minify', 'js:minify'), function copyAssets() {
  return gulp.src([
    '*.html',
  ], { base: './' })
    .pipe(gulp.dest('dist'));
}));

// Default task
gulp.task("default", gulp.series("clean", 'build', 'replaceHtmlBlock'));