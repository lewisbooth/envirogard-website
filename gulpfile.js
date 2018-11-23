var gulp = require("gulp")
var plumber = require('gulp-plumber')
var stylus = require("gulp-stylus")
var postcss = require("gulp-postcss")
var autoprefixer = require("autoprefixer")
var cssnano = require("cssnano")
var babel = require("gulp-babel")
var minify = require("gulp-minify")
var jsImport = require("gulp-js-import")
var browserSync = require("browser-sync").create()

gulp.task("default", ["serve"])

// Start the BrowserSync server
gulp.task("serve", ["stylus", "scripts"], () => {
  browserSync.init({ proxy: "localhost:8888" })
  // Watch for file changes and run the appropriate tasks
  gulp.watch("styles/**/*.styl", ["stylus"])
  gulp.watch("scripts/**/*.js", ["watch-scripts"])
  gulp.watch("views/**/*.pug").on("change", browserSync.reload)
})

gulp.task("watch-scripts", ["scripts"], () => {
  browserSync.reload()
})

// Transpile & minify JavaScript from ES6+ to ES5
gulp.task("scripts", () => {
  return gulp
    .src("scripts/**/*.js")
    .pipe(plumber())
    .pipe(jsImport({ hideConsole: true }))
    .pipe(babel({
      presets: ["env"]
    }))
    .pipe(minify({
      noSource: true,
      ext: { min: ".js" }
    }))
    .pipe(gulp.dest("public/js"))
})

// Transpile Stylus into CSS and add browser prefixes
gulp.task("stylus", () => {
  var plugins = [
    autoprefixer({ browsers: ["last 3 versions"] }),
    cssnano({ discardUnused: false })
  ]
  return gulp
    .src("styles/*.styl")
    .pipe(plumber())
    .pipe(stylus())
    .pipe(postcss(plugins))
    .pipe(gulp.dest("public/css"))
    .pipe(browserSync.stream())
})

