var gulp = require('gulp');
// var htmlmin = require('gulp-htmlmin');
var sass = require('gulp-sass');
var ts = require('gulp-typescript');
var runSequence = require('run-sequence');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();

var defaultAssets = {
  components:{
    sass:[
      './app/styles/*.scss',
      './app/**/styles/*.scss'
    ],
    views:[
      './app/**/views/*.html'
    ],
    ts:[
      './app/*.ts',
      './app/**/*.ts'
    ]
  }
};

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
    gulp.watch('./dist/index.html').on('change', browserSync.reload);
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
    .pipe(rename(function (path) {
      path.dirname = path.dirname.replace('styles', '');
    }))
    .pipe(gulp.dest('./dist/assets/styles'));
});

gulp.task('html', function() {
  return gulp.src(defaultAssets.components.views)
  .pipe(rename(function (path) {
    path.dirname = path.dirname.replace('/views', '');
  }))

    // .pipe(htmlmin({
    //   collapseWhitespace: true,
    //   customAttrAssign:[
    //     [ /\{\{*\s+\w+\}\}/, /\{\{\/if\}\}/ ]
    //   ]
    // }))
    .pipe(gulp.dest('./dist/views'))
});

// Typescript task
gulp.task('tsc', function () {
  var tsProject = ts.createProject('tsconfig.json');
  var tsResult = tsProject.src() // instead of gulp.src(...)
  .pipe(ts(tsProject));

  return tsResult.js
  .pipe(rename(function (path) {
    path.dirname = path.dirname.replace('/components', '');
  }))
  .pipe(gulp.dest('./dist/assets/js'));

	// gulp.src(defaultAssets.client.ts)
	// .pipe(plugins.typescript({
	// 	typescript: require('typescript'),
	// 	target: 'ES5',
	// 	module: 'commonjs',
	// 	declarationFiles: false,
	// 	noExternalResolve: true
	// }))
	// .pipe(plugins.rename(function (path) {
	// 	path.dirname = '';
	// }))
	// .pipe(gulp.dest('./build/'));
});

// Lint CSS and JavaScript files.
gulp.task('lint', function(done) {
	runSequence('sass', 'html', 'tsc', done);
});

// Run the project in development mode
gulp.task('default', function(done) {
	runSequence('env:dev', 'lint', ['browser-sync'], done);
});
