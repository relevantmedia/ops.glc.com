var gulp = require('gulp');
var sass = require('gulp-sass');
var ts = require('gulp-typescript');
var runSequence = require('run-sequence');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();
var harp = require('harp');

var defaultAssets = {
  components:{
    sass:[
      './components/styles/*.scss',
      './components/**/styles/*.scss'
    ],
    views:[
      './components/**/views/*.jade'
    ],
    ts:[
      './components/*.ts',
      './components/**/*.ts'
    ]
  }
};

/**
 * Serve the Harp Site from the src directory
 */
gulp.task('serve', function () {
  harp.server(__dirname, {
    port: 9000
  }, function () {
    browserSync.init({
      proxy: "localhost:9000",
      // open: false,
      /* Hide the notification. It gets annoying */
      // notify: {
      //   styles: ['opacity: 0', 'position: absolute']
      // }
    });
    gulp.watch(['./index.jade','./_layout.jade']).on('change', browserSync.reload);
    gulp.watch(defaultAssets.components.sass, ['sass']);
    gulp.watch(defaultAssets.components.views, ['html']).on('change', browserSync.reload);
    gulp.watch(defaultAssets.components.ts, ['tsc']).on('change', browserSync.reload);
  })
});

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch('./index.html').on('change', browserSync.reload);
    gulp.watch(defaultAssets.components.sass, ['sass']);
    gulp.watch(defaultAssets.components.views).on('change', browserSync.reload);
    gulp.watch(defaultAssets.components.ts, ['tsc']).on('change', browserSync.reload);
});

// Set NODE_ENV to 'development'
gulp.task('env:dev', function () {
	process.env.NODE_ENV = 'development';
});

gulp.task('sass', function () {
  gulp.src(defaultAssets.components.sass)
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./app'));
});

gulp.task('html', function() {
  return gulp.src(defaultAssets.components.views)
    .pipe(gulp.dest('./app'))
});

// Typescript task
gulp.task('tsc', function () {
  var tsProject = ts.createProject('tsconfig.json');
  var tsResult = tsProject.src() // instead of gulp.src(...)
  .pipe(ts(tsProject));

  return tsResult.js
  .pipe(rename(function (path) {
    path.dirname = path.dirname.replace('components', '');
  }))
  .pipe(gulp.dest('app'));
});

// Lint CSS and JavaScript files.
gulp.task('lint', function(done) {
	runSequence('sass', 'html', 'tsc', done);
});

// Run the project in development mode
gulp.task('default', function(done) {
	runSequence('env:dev', 'lint', ['serve'], done);
});
