// grab our gulp packages
var gulp =          require('gulp');
var run =           require('run-sequence');
var jade =          require('gulp-jade');
var sass =          require('gulp-sass');
var del =           require('del');
var sourcemaps =    require('gulp-sourcemaps');
var concat =        require('gulp-concat');
var livereload =    require('gulp-livereload');
var cache =         require('gulp-cache');
var uglify =        require('gulp-uglify');
var autoprefixer =  require('gulp-autoprefixer');

gulp.task('default', ['live']);

gulp.task('build-jade', function() {
    return gulp.src('src/**/*.jade')
        .pipe(jade()) // pip to jade plugin
        .pipe(gulp.dest('./build/')); // tell gulp our output folder
});

gulp.task('build-js', function() {
    return gulp.src('src/scripts/**/*.js')
        //.pipe(sourcemaps.init())
        //.pipe(concat('main.js'))
        ////.pipe(rename({suffix: '.min'}))
        //.pipe(uglify())
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('build/scripts'));
});

gulp.task('build-css', function() {
    return gulp.src('src/styles/**/*.scss')
        .pipe(sourcemaps.init())  // Process the original sources
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 20 versions', 'last 20 Chrome versions', '> 20%','ie 6-8'],
            cascade: false
        }))
        .pipe(sourcemaps.write()) // Add the map to modified source.
        .pipe(gulp.dest('./build/styles/'));
});
gulp.task('build-css-plugin', function() {
    return gulp.src('src/**/*.css')
        .pipe(sourcemaps.init())  // Process the original sources
        .pipe(gulp.dest('./build/'));
});
gulp.task('clean', function (next) {
    return del('build', next);
});

gulp.task('build', function (next) {
    run('clean', ['build-jade', 'build-js', 'build-css','build-css-plugin'], next);
});

gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('src/**/*.jade', ['build-jade']);
    gulp.watch('src/scripts/**/*.js', ['build-js']);
    gulp.watch('src/styles/**/*.scss', ['build-css']);
    gulp.watch('src/**/*.css', ['build-css-plugin']);
});

gulp.task('live', function(next) {
    run('build', 'watch', next);
});