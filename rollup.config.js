import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
export default {
    input: './src/index.js',
    output: {
        format: 'umd', // 支持amd 和 commonjs  
        name: 'Vue', // window.Vue
        file: 'dist/vue.js',
        sourcemap: true,
    },
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
        resolve({})
    ]
}