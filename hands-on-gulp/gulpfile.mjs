import { src, dest, series } from "gulp";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";

import sourcemaps from "gulp-sourcemaps";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";

const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;

const sass = gulpSass(dartSass);

export function stylesDev() {
  return src("src/scss/**/*.scss", { sourcemaps: true })
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(sourcemaps.write("."))
    .pipe(dest("dist/css"));
}

export function stylesProd() {
  return src("src/scss/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cleanCSS({ level: 2 }))
    .pipe(dest("dist/css"));
}

export const styles = isProd ? stylesProd : stylesDev;

export function noop(done){ done(); }

export default series(noop);
