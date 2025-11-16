import { src, dest, series } from "gulp";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";

import sourcemaps from "gulp-sourcemaps";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";

import posthtml from "gulp-posthtml";
import include from "posthtml-include";
import htmlmin from "gulp-htmlmin";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));

import terser from "gulp-terser";

const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;

export function htmlDev() {
  return src(["src/html/**/*.html", "!src/html/components/**"])
    .pipe(posthtml([ include({ root: path.join(__dirname, "src/html") }) ]))
    .pipe(dest("dist/"));
}

export function htmlProd() {
  return src(["src/html/**/*.html", "!src/html/components/**"])
    .pipe(posthtml([ include({ root: path.join(__dirname, "src/html") }) ]))
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(dest("dist/"));
}

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

export function scriptsDev() {
  return src("src/scripts/**/*.js")
    .pipe(dest("dist/js"));
}

export function scriptsProd() {
  return src("src/scripts/**/*.js")
    .pipe(terser().on("error",(err)=>{ console.error("terser:", err.message); }))
    .pipe(dest("dist/js"));
}

export const html = isProd ? htmlProd : htmlDev;
export const styles = isProd ? stylesProd : stylesDev;
export const scripts = isProd ? scriptsProd : scriptsDev;

export function noop(done){ done(); }

export default series(noop);
