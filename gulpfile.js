'use strict'

const babel = require('gulp-babel')
const gulp = require('gulp')
const merge = require('merge2')
const sourcemaps = require('gulp-sourcemaps')
const ts = require('gulp-typescript')

function makeTasks(name, dest) {
  const glob = `${name}/**/*.ts`
  const build = `build-${name}`
  const tsProject = ts.createProject(`./${name}/tsconfig.json`, {
    typescript: require('typescript')
  })

  gulp.task(build, () => {
    const tsResult = gulp.src(glob)
      .pipe(sourcemaps.init())
      .pipe(ts(tsProject))
    const js = tsResult.js
      .pipe(babel(babelOpts))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(dest))
    return merge([js, tsResult.dts.pipe(gulp.dest(dest))])
  })

  gulp.task(`watch-${name}`, [build], () =>
    gulp.watch(glob, [build]))
}

const babelOpts = {
  plugins: [
    require('babel-plugin-transform-es2015-destructuring'),
    require('babel-plugin-transform-es2015-parameters'),
    require('babel-plugin-transform-es2015-spread'),
    require('babel-plugin-transform-strict-mode')
  ]
}

makeTasks('src', 'lib')
makeTasks('test', 'compiled-test')
