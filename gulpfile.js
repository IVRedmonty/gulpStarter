"use strict";
const {src, dest} = require("gulp"),
    gulp = require("gulp"),
    autoprefixer = require("gulp-autoprefixer"),
    cssbeautify = require("gulp-cssbeautify"),
    removeComments = require('gulp-strip-css-comments'),
    rename = require("gulp-rename"),
    sass = require("gulp-sass"),
    cssnano = require("gulp-cssnano"),
    rigger = require("gulp-rigger"),
    uglify = require("gulp-uglify"),
    plumber = require("gulp-plumber"),
    imagemin = require("gulp-imagemin"),
    del = require("del"),
    panini = require("panini"),
    browsersync = require("browser-sync").create();
var path = {
    build: {
        html: "dist/",
        js: "dist/js/",
        css: "dist/assets/css/",
        images: "dist/assets/img/"
    },
    src: {
        html: "src/*.html",
        js: "src/assets/js/*.js",
        css: "src/assets/sass/style.scss",
        images: "src/assets/img/**/*.{jpg,png,svg,gif,ico}"
    },
    watch: {
        html: "src/**/*.html",
        js: "src/assets/js/**/*.js",
        css: "src/assets/sass/**/*.scss",
        images: "src/assets/img/**/*.{jpg,png,svg,gif,ico}"
    },
    clean: "./dist"
}
function browserSync (done){
    browsersync.init({
        server: {
            baseDir: "./dist/"
        },
        port: 3000
    })
}
function html() {
    panini.refresh();
    return src(path.src.html, {base: "src/"})
        .pipe(plumber())
        .pipe(panini({
            root: 'src/',
            layouts: 'src/tpl/layouts/',
            partials: 'src/tpl/partials/',
            helpers: 'src/tpl/helpers/',
            data: 'src/tpl/data/'
          }))
        .pipe(dest(path.build.html));
}
function css() {
    return src(path.src.css, {base: "src/assets/sass"})
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer({
        Browserslist: ['last 6 versions'],
        cascade: true
    }))
    .pipe(cssbeautify())
    .pipe(dest(path.build.css))
    .pipe(cssnano({
        zindex: false,
        discardComments: {
            removeAll: true
        }
    }))
    .pipe(removeComments())
    .pipe(rename({
        suffix: '.min',
        extname: '.css'
    }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}
function js() {
    return src(path.src.js, {base: "src/js/"})
        .pipe(plumber())
        .pipe(rigger())//склейка
        .pipe(dest(path.build.js))//отправка
        .pipe(uglify())//сжатие
        .pipe(rename({//переименование
            suffix: '.min',
            extname: '.js'
        }))
        .pipe(dest(path.build.js))//отправка минверсии
        .pipe(browsersync.stream());
}
function images() {
    return src(path.src.images)
        .pipe(imagemin())
        .pipe(dest(path.build.images))
}
function clean() {
    return del(path.clean)
}
function watchFiles() {
    gulp.watch([path.watch.html], html),
    gulp.watch([path.watch.css], css),
    gulp.watch([path.watch.js], js),
    gulp.watch([path.watch.images], images)
}
const build = gulp.series(clean, gulp.parallel(html, css, js, images)),
    watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;