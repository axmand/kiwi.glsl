import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
    //exports: 'named',
    input: './src/init.js',
    name:'kiwi.glsl',
    output:{
        format:'iife',
        file:'./dist/kiwi.glsl.js'
    },
    external: [
        'fs',
        'steam',
        'path'
    ],
    plugins: [
        resolve(),
        commonjs(),
        babel({
            exclude: 'node_modules/**'
        })
    ]
};