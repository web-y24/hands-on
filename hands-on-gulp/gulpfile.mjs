import { src, dest, series, watch, parallel } from "gulp";
import { deleteAsync } from "del";

import gulpSass from "gulp-sass";
import * as dartSass from "sass";

import sourcemaps from "gulp-sourcemaps";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";

import posthtml from "gulp-posthtml";
import include from "posthtml-include";
import htmlmin from "gulp-htmlmin";

import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminOptipng from "imagemin-optipng";
import imageminPngquant from "imagemin-pngquant";
import imageminSvgo from "imagemin-svgo";
import webp from "gulp-webp";

import newer from "gulp-newer";

import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));

import terser from "gulp-terser";

import browserSyncLib from "browser-sync";
const browserSync = browserSyncLib.create();

const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;

export function clean() {
  return deleteAsync(["dist/**", "!dist"]);
}

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

export function imagesCopy() {
  return src("src/images/**/*.{jpg,jpeg,png,svg}",{encoding: false})
    .pipe(newer("dist/images"))
    .pipe(dest("dist/images"));
}

export async function imagesOptimize() {
  await imagemin(["src/images/*.{jpg,jpeg,png,svg}"], {
    destination: "dist/images",
    plugins: [
      imageminMozjpeg({ quality: 75, progressive: true }),
      imageminOptipng({
        optimizationLevel: 7,
        bitDepthReduction: true,
        colorTypeReduction: true,
        paletteReduction: true,
      }),
      imageminPngquant({
        quality: [0.6, 0.8],
        speed: 1,
        strip: true,
        dithering: 0.5,
      }),
      imageminSvgo({
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
        ],
      }),
    ],
  });
}

export function webpImages() {
  return src("src/images/**/*.{jpg,jpeg,png}", { encoding: false })
    .pipe(newer("dist/images"))
    .pipe(webp({ quality: 75 }))
    .pipe(dest("dist/images"));
}

export const html = isProd ? htmlProd : htmlDev;
export const styles = isProd ? stylesProd : stylesDev;
export const scripts = isProd ? scriptsProd : scriptsDev;

export function noop(done){ done(); }

function reload(done) {
  browserSync.reload();
  done();
}

export function serve() {
  browserSync.init({
    server: { baseDir: "dist/" },
    notify: false,
    open: false,
  });
  watch("src/scss/**/*.scss", series(styles, reload));
  watch(["src/html/**/*.html"], series(html, reload));
  watch("src/scripts/**/*.js", series(scripts, reload));
  watch("src/images/**/*", series(imagesOptimize, webpImages, reload));
}

export const build = series(clean, parallel(html, styles, scripts, imagesOptimize, webpImages));
export default series(build, serve);
