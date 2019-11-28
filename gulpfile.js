const { src, dest,  watch, series, parallel } = require('gulp');

const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const del = require("del");

const cache = require('gulp-cache');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');

const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const less = require('gulp-less');
const path = require('path');
const sassGlob = require('gulp-sass-glob');
sass.compiler = require('node-sass');

const url_src = "src/";
const url_dest = "build/";

/* Delete all files in */
function clean() {
  return del([url_dest + "*"]);
}

/* Complie JS */
function js() {
  return src(url_src + "js/**/*.js")
    .pipe(uglify())
    .pipe(concat('main.js')).pipe(
      browserSync.reload({
        stream: true
    })
    ).pipe(dest(url_dest + "js/"))
}
/* Complie Css from Less with autoprefixer */
function css() {
  return src(url_src + 'scss/style.scss')
    .pipe(sassGlob())
    .pipe(
      sass({
        outputStyle: 'expand' //expand or compact or compressed
      })
      .on('error', sass.logError)
    ).pipe(
      browserSync.reload({
        stream: true
    })
    ).pipe(
      autoprefixer({
        cascade: true
    })
    ).pipe(dest(url_dest + 'css/'));
}


/* Complie Css from Less with autoprefixer */

function cssLess() {
  return src(url_src + 'less/style.less')
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes')]
    })).pipe(
      autoprefixer({
        browsers: ['last 4 versions'],
        cascade: false
    })
    ).pipe(dest(url_dest + 'less/'));
}


function images() {
  return src(url_src + 'img/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(
        cache(imagemin(
          {
            interlaced: true,
          }
        )
      )
    ).pipe(dest(url_dest + 'img'));
}



function watchFiles() {
  watch(url_src + "js/**/*.js", js);
  watch(url_src + "scss/**/*", css);
  watch(url_src + "less/**/*.less", cssLess);
  watch(url_src+'img/**/*.+(png|jpg|jpeg|gif|svg)' , images) ;
  // watch("*", refreshPage);
}

function refreshPage() {
  browserSync.init({
    server: {
      baseDir: './'
    },
  });
  watch("./*").on('change', browserSync.reload);
}

 


exports.clean = clean;
exports.refreshPage = refreshPage;
// exports.vendors = vendors;
// exports.fonts = fonts;
// exports.img = images;
exports.cssLess = cssLess;
exports.css = css;
exports.js = js;
exports.watch = watchFiles;
exports.start = series(parallel(js, css, images), parallel(refreshPage, watchFiles));
exports.build = series(clean, parallel(js, css, images), watchFiles);
exports.default = watchFiles;
