/* dependencies */
var fs          = require('fs');
var gulp        = require('gulp');
var plumber     = require('gulp-plumber');
var concat      = require('gulp-concat');
var rename      = require('gulp-rename');
var server      = require('browser-sync');

var handlebars  = require('gulp-static-handlebars');

var less        = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var postcss     = require('gulp-postcss');
var size        = require('postcss-size');
var autoreset   = require('postcss-autoreset');
var mergeRules  = require('postcss-merge-rules');
var stylelint   = require('stylelint');

var htmlmin     = require('gulp-htmlmin');
var nano        = require('gulp-cssnano');
var imgmin      = require('gulp-imagemin');
var pngquant    = require('imagemin-pngquant');

/* configs */
var data = fs.readFileSync(__dirname + '/blocks/data.json');
var config = {
    html: {
        sourcePath: __dirname + '/blocks/common/common.hbs',
        destPath: __dirname + '/build'
    },
    style: {
        sourcePath: __dirname + '/blocks/**/*.less',
        destPath: __dirname + '/build/css',
        autoprefixer: {browsers: [
            'last 1 version',
            'last 2 Chrome versions',
            'last 2 Firefox versions',
            'last 2 Opera versions',
            'last 2 Edge versions'
        ]},
        postcss: [stylelint(), size, mergeRules, autoreset]
    },
    image: {
        sourcePath: __dirname + '/blocks/**/*.{jpg,ico,png,jpeg,gif,svg,xml}',
        destPath: __dirname + '/build/images'
    }
};


/* build html from handlebars */
gulp.task('build-html', function () {
    gulp.src(config.html.sourcePath)
        .pipe(plumber())
        .pipe(handlebars(JSON.parse(data), {
            partials: gulp.src('./blocks/**/*.hbs')
        }))
        .pipe(rename('index.html'))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(config.html.destPath))
        .pipe(server.reload({stream: true}));
});

/* build css from less*/
gulp.task('build-style', function () {
    gulp.src(config.style.sourcePath)
        .pipe(plumber())
        .pipe(less())
        .pipe(concat('index.css'))
        .pipe(autoprefixer(config.style.autoprefixer))
        .pipe(postcss(config.style.postcss))
        .pipe(nano())
        .pipe(gulp.dest(config.style.destPath));
});

/* minify & move images */
gulp.task('move-images', function () {
    gulp.src(config.image.sourcePath)
        .pipe(imgmin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(rename({dirname: ''}))
        .pipe(gulp.dest(config.image.destPath));
});

/* hot reload task */
gulp.task('serve', ['build-html', 'build-style', 'move-images'], function () {
    server.init({
        server: './build/',
        notify: false,
        open: true,
        ui: false
    });

    gulp.watch(config.style.sourcePath, ['build-style']);
    gulp.watch(config.style.destPath + '/*.css').on('change', server.reload);

    gulp.watch(config.html.sourcePath, ['build-html']);
    gulp.watch(config.html.destPath + '/*.html').on('change', server.reload);

    gulp.watch(config.image.sourcePath, ['move-images']);
    gulp.watch(config.image.destPath + '/*.{jpg,ico,png,jpeg,gif,svg,xml}').on('change', server.reload);
});

/* on default task build html & css */
gulp.task('default', ['build-html', 'build-style', 'move-images']);
