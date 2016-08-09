var gulp = require('gulp');
var compiler = require('typescript');
var typescript = require('gulp-typescript');
var ngAnnotate 		= require('gulp-ng-annotate');
var merge = require('merge2');

//require('./build/clean/cleanTask');

var project = typescript.createProject({
	//typescript: compiler,
	declaration: true,
	noExternalResolve: false,
	noEmitOnError: true,
	target: 'ES5',
	removeComments: false,
	module: "system",
});

gulp.task('ts', function(done){
	var result = gulp.src(['src/app/**/*.ts', '!src/jspm_packages/**/*.*', './typings/main.d.ts'])
	.pipe(typescript(project));
	return merge([
        result.dts.pipe(gulp.dest('dist')),
        result.js.pipe(ngAnnotate({ gulpWarnings: false })).pipe(gulp.dest('dist'))
    ]);
});