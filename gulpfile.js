/*global require */

var gulp = require("gulp"),
    gUtil = require("gulp-util"),
    uglify = require("gulp-uglify"),
    concat = require("gulp-concat"),
    cleanCss = require("gulp-clean-css"),
    prefixer = require("gulp-autoprefixer"),
    gulpIf = require("gulp-if"),
    watch = require("gulp-watch"),
    merge = require("merge-stream"),
    gutil = require("gulp-util"),
    minifycss = require("gulp-clean-css"),
    gulpif = require("gulp-if"),
    sass = require("gulp-sass"),
    strip = require("gulp-strip-comments"),
    tap = require("gulp-tap")
    ;

var cfg = {
    path: {
        src: "src/",
        dist: {
            css: "dist/css/",
            js: "dist/js/"
        },
        demo: {
            css: "demo/css/"
        }
    }
};

var vendorFiles = {
    js: [
        cfg.path.src + "**/*.js"
    ],
    scss: [
        cfg.path.src + "**/*.scss"
    ],
    scssDemo: [
        cfg.path.demo.css + "**/*.scss"
    ]
};

/* Javascript Minify */

gulp.task("js", function () {
    "use strict";
    return gulp.src(vendorFiles.js)
        .pipe(strip())
        .pipe(concat("vendor.js"))
        .pipe(gulp.dest(cfg.path.dist.js))
        .pipe(uglify())
        .pipe(concat("vendor.min.js"))
        .pipe(gulp.dest(cfg.path.dist.js))
        .on("error", gUtil.log);
});

/* Compile scss and minify */

gulp.task("scss", function () {
    "use strict";
    var plugin =
        gulp.src(vendorFiles.scss)
            .pipe(sass().on("error", sass.logError))
            .pipe(prefixer("last 6 version", "> 5%", "ie 8", "opera 12.1", "ios 6", "android 4", "Firefox > 20"))
            .pipe(concat("vendor.css"))
            .pipe(gulp.dest(cfg.path.dist.css))
            .pipe(cleanCss({compatibility: "ie8", keepSpecialComments: 0}))
            .pipe(minifycss({keepSpecialComments: 0}))
            .pipe(concat("vendor.min.css"))
            .pipe(gulp.dest(cfg.path.dist.css))
            .on("error", gUtil.log);
    var demo = gulp.src(vendorFiles.scssDemo)
        .pipe(sass().on("error", sass.logError))
        //.pipe(concat("index.css"))
        .pipe(gulp.dest(cfg.path.demo.css))
        .on("error", gUtil.log);
    return merge(plugin, demo);
});

/* Watch */

gulp.task("watch", function () {
    "use strict";
    // path, [task name]
    gulp.watch("**/*.scss", ["scss"]);
    gulp.watch(cfg.path.src + "**/*.js", ["js"]);
});

/* Base Tasks */

gulp.task("default", function () {
    gutil.log("Gulp Runing");
    gulp.start([
        "scss",
        "js",
        "watch"
    ]);
});
