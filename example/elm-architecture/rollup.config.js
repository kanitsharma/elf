import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonJS from "rollup-plugin-commonjs";
import { uglify } from "rollup-plugin-uglify";
import replace from "rollup-plugin-replace";

export default {
  input: "example/elm-architecture/index.js",
  output: {
    name: "main",
    file: "example/elm-architecture/dist/main.js",
    format: "iife"
  },
  plugins: [
    resolve({
      jsnext: true,
      browser: true
    }),
    commonJS({
      include: "node_modules/**"
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    babel({
      exclude: "node_modules/**"
    }),
    uglify()
  ]
};
