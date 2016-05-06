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
var mergeRules  = require('postcss-merge-rules');
var stylelint   = require('stylelint');

var htmlmin     = require('gulp-htmlmin');
var cssmin      = require('gulp-cssmin');
var uglify      = require('gulp-uglify');
var imgmin      = require('gulp-imagemin');
var pngquant    = require('imagemin-pngquant');

/* configs */
var data = fs.readFileSync(__dirname + '/blocks/data.json');
var config = {
    html: {
        sourcePath: __dirname + '/blocks/common/common.hbs',
        destPath: __dirname + '/build',
        exts: '/*.html',
        tasks: ['build-html']
    },
    style: {
        sourcePath: __dirname + '/blocks/**/*.less',
        destPath: __dirname + '/build/css',
        exts: '/*.css',
        tasks: ['build-style'],
        autoprefixer: {browsers: [
            'last 5 version',
            'last 5 Chrome versions',
            'last 5 Firefox versions',
            'last 5 Opera versions',
            'last 5 Edge versions'
        ]},
        postcss: [stylelint(), size, mergeRules]
    },
    js: {
        sourcePath: __dirname + '/blocks/**/*.js',
        destPath: __dirname + '/build/js',
        exts: '/*.js',
        tasks: ['build-js']
    },
    image: {
        sourcePath: __dirname + '/blocks/**/*.{jpg,ico,png,jpeg,gif,svg,xml}',
        destPath: __dirname + '/build/images',
        exts: '/*.{jpg,ico,png,jpeg,gif,svg,xml}',
        tasks: ['build-images']
    },
    font: {
        sourcePath: __dirname + '/blocks/**/*.{eot,ttf,woff,woff2}',
        destPath: __dirname + '/build/fonts',
        exts: '/*.{eot,ttf,woff,woff2}',
        tasks: ['build-fonts']
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
        .pipe(concat('_index.css'))
        .pipe(autoprefixer(config.style.autoprefixer))
        .pipe(postcss(config.style.postcss))
        .pipe(cssmin())
        .pipe(rename('index.css'))
        .pipe(gulp.dest(config.style.destPath));
});

/* process js */
gulp.task('build-js', function () {
    return gulp.src(config.js.sourcePath)
        .pipe(concat('index.js'))
        .pipe(uglify())
        .pipe(gulp.dest(config.js.destPath))
});

/* move fonts */
gulp.task('move-fonts', function () {
    gulp.src(config.font.sourcePath)
        .pipe(rename({dirname: ''}))
        .pipe(gulp.dest(config.font.destPath));
});

/* minify & move images */
gulp.task('move-images', function () {
    gulp.src(config.image.sourcePath)
        .pipe(rename({dirname: ''}))
        .pipe(imgmin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(config.image.destPath));
});

/* hot reload task */
gulp.task('serve', ['build-html', 'build-style', 'move-images', 'move-fonts', 'build-js'], function () {
    server.init({
        server: './build/',
        notify: false,
        open: true,
        ui: false
    });

    Object.keys(config).map(function (key) {
        var currentType = config[key];
        var timeout;

        gulp.watch(currentType.sourcePath, currentType.tasks);
        gulp.watch(currentType.destPath + currentType.exts).on('change', function () {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(function () {
                server.reload();
                clearTimeout(timeout);
            }, 300)});
    });
});

/* on default task build html & css */
gulp.task('default', ['build-html', 'build-style', 'move-images', 'move-fonts', 'build-js']);
