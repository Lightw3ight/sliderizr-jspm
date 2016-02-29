var gulp = require('gulp');
var compiler = require('typescript');
var typescript = require('gulp-typescript');
//require('./build/clean/cleanTask');

var project = typescript.createProject({
	typescript: compiler,
	declarationFiles: false,
	noExternalResolve: false,
	noEmitOnError: true,
	target: 'ES5',
	removeComments: false,
	module: "system",
});

gulp.task('ts', function(done){
	return gulp.src(['src/app/**/*.ts', '!src/jspm_packages/**/*.*', './typings/main.d.ts'])
	.pipe(typescript(project))
	.pipe(gulp.dest('dist'));
});