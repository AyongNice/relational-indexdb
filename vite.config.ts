import {defineConfig} from 'vite'

const config = require("./package.json")
// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: { // 库模式构建相关配置
            entry: './index.ts',
            name: "relational-indexdb",//则在其他项目中引入您的库时，
            formats: ['es'], // 指定打包格式为 ES 模块
        },
        rollupOptions: {
            output: {
                // specify the output directory
                dir: 'dist',
                // specify the output file name
                entryFileNames: `${config.name}.js`,
                format: 'es',
                // specify the format of the output file
                exports: 'default', // 使用命名导出
            }
        }
    },
})
