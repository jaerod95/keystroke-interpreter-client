//Compile all my javascript files into one master minified file that I reference in my main js file.
//1. compile 2. Minify

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        },
    });
});

gulp.task('sass', function() {
    return gulp.src('./lib/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./lib/css'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('reload', () => {
    browserSync.reload();
})

gulp.task('sass:watch', function() {
    gulp.watch('./lib/sass/**/*.scss', ['sass']);
});

gulp.task('watch', () => {
    gulp.watch(['./lib/**/*.js', '.lib/**/*.html', './lib/**/*.css'], ['reload']);
});

gulp.task("default", ['browser-sync', 'sass', 'sass:watch', 'watch']);