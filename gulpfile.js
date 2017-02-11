var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();
var cp = require('child_process');
var del = require('del');

gulp.task('clean', function() {
  return del(['*/*.css', '*/*.css.map']);
});

gulp.task('jekyll-build', function(done) {
  browserSync.notify('Jekyll build');
  cp.exec('bundle exec jekyll build --config _config.yml,_config.local.yml', function(err, stdout, stderr) {
    console.log(stdout);
  }).on('exit', function(code) {
    done(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
  });
});

gulp.task('jekyll-rebuild', ['jekyll-build'], function() {
  browserSync.reload();
});


gulp.task('serve', ['sass:dev', 'jekyll-build'], function() {
  browserSync.init({
    server: {
      baseDir: '_site'
    }
  });

  gulp.watch(['*/*.scss', '!_site/**'], ['sass:dev']).on('change', function(event) {
    console.log('SCSS: File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
  gulp.watch(['**/*.{html,md}', '!_site/**'], ['jekyll-rebuild']).on('change', function(event) {
    console.log('HTML: File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});

gulp.task('sass:dev', ['clean'], function() {
  return gulp.src('*/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: 'node_modules/bulma'
    }).on('error', sass.logError))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('_site/'))
    .pipe(browserSync.stream());
    .pipe(gulp.dest('.'));
});

gulp.task('sass', ['clean'], function() {
  return gulp.src('*/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: 'node_modules/bulma'
    }).on('error', sass.logError))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(autoprefixer())
    .pipe(cssnano())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['serve']);
