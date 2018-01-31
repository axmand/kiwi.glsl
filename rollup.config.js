import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: './src/init.js',
    output:{
        globals:'',
        exports: 'named',
        name:'kiwi',
        format:'umd',
        file:'./dist/bundle.js'
    },
    external: [
        'fs',
        // 'steam',
        'path'
    ],
    plugins: [
        resolve({
            jsnext: true,
            main: true
        }),
        commonjs(),
        babel({
            exclude: 'node_modules/**'
        })
    ]
};