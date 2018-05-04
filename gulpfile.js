const gulp = require('gulp');
const sass = require('gulp-sass');
const notify = require('gulp-notify');
const browserSync = require('browser-sync');
const gulpImport = require('gulp-html-import');
const tap = require('gulp-tap');
const browserify = require('browserify');
const buffer = require('gulp-buffer');
const sourcemaps = require('gulp-sourcemaps');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const imagemin = require('gulp-imagemin');
const responsive = require('gulp-responsive');

// BrowserSync Instance
browserSync.create();

// Source and Distribution Folders
const source = 'src/';
const dest = 'dist/';
const origin = './';

// Bootstrap Sources
const bootstrapSass = { in: './node_modules/bootstrap-sass/',
};

// fonts
const fonts = { in: [`${source}fonts/*.*`, `${bootstrapSass.in}assets/fonts/**/*`],
	out: `${dest}fonts/`,
};

// Our scss source folder: .scss files
const scss = { in: `${source}scss/main.scss`,
	out: `${dest}css/`,
	watch: `${source}scss/**/*`,
	sassOpts: {
		outputStyle: 'nested',
		precison: 3,
		errLogToConsole: true,
		includePaths: [`${bootstrapSass.in}assets/stylesheets`]
	}
};

// copy bootstrap required fonts to dest
gulp.task('fonts', () => {
	return gulp
		.src(fonts.in)
		.pipe(gulp.dest(fonts.out));
});

// compile scss
gulp.task('sass', ['fonts'], () => {
	return gulp.src(scss.in)
		.pipe(sourcemaps.init())
		.pipe(sass(scss.sassOpts).on('error', (error) => {
			return notify().write(error);
		}))
		.pipe(postcss([
			autoprefixer(),
			cssnano()
		]))
		.pipe(sourcemaps.write(origin))
		.pipe(gulp.dest(scss.out))
		.pipe(browserSync.stream())
		.pipe(notify('SASS Compilado 🤘🏻'));
});

// copiar e importar html
gulp.task('html', () => {
	gulp.src(`${source}components/*.html`)
		.pipe(gulpImport([`${source}components/`]))
		.pipe(htmlmin({
			collapseWhitespace: true,
		}))
		.pipe(gulp.dest(dest))
		.pipe(browserSync.stream())
		.pipe(notify('HTML importado 🤘🏻'));
});

gulp.task('js', () => {
	gulp.src(`${source}js/main.js`)
		.pipe(tap((file) => {
			file.contents = browserify(file.path, {
				debug: true,
			}).transform('babelify', {
				presets: ['env'],
			}).bundle().on('error', (error) => {
				return notify().write(error);
			});
		}))
		.pipe(buffer())
		.pipe(sourcemaps.init({
			loadMaps: true,
		}))
		.pipe(uglify())
		.pipe(sourcemaps.write(origin))
		.pipe(gulp.dest(dest))
		.pipe(browserSync.stream())
		.pipe(notify('JS Compilado'));
});

gulp.task('img', () => {
	gulp.src(`${source}images/*`)
		/* .pipe(responsive({
            '*.png': [
                {width: 150, rename:{suffix: '-150px'}}, //mobile
                {width: 250, rename:{suffix: '-250px'}}, //tablet
                {width: 300, rename:{suffix: '-300px'}}  //desktop
            ]
		}))
		.pipe(imagemin()) */
		.pipe(gulp.dest(`${dest}images/`));
});

// DEFAULT task
gulp.task('default', ['img', 'html', 'sass', 'js'], () => {
	browserSync.init({
		server: `${origin}${dest}`,
		startPath: '/',
		// changing the default port '3000'
		port: 3100,
		// proxy: 'http://127.0.0.1:3100/',
		// Don't show any notifications in the browser.
		notify: false,
		browser: ['google chrome' /* , 'firefox' */ ],
	});
	gulp.watch([`${source}scss/*.scss`, `${source}scss/**/*.scss`], ['sass']);
	gulp.watch([`${source}*.html`, `${source}**/*.html`], ['html']);
	gulp.watch([`${source}*.js`, `${source}js/**/*.js`], ['js']);
});