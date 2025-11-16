import { src, dest, series } from "gulp";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";

const sass = gulpSass(dartSass);

export function styles() {
  return src("src/scss/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(dest("dist/css"));
}

export function noop(done){ done(); }

export default series(noop);
