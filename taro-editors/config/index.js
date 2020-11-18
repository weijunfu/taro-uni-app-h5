
const config = {
  projectName: 'lz-donation',
  date: '2020-11-2',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: `dist/${process.env.TARO_ENV}`,
  plugins: [],
  terser: {
    enable: true,
    config: {
      // 配置项同 https://github.com/terser/terser#minify-options
    }
  },
  csso:{
    enable: true,
    config: {
      // 配置项同 https://github.com/css/csso#minifysource-options
    }
  },
  defineConstants: {
  },
  copy: {
    patterns: [
    ],
    options: {
    }
  },
  framework: 'nerv',
  mini: {
    postcss: {
      autoprefixer: {
        enable: true
      },
      pxtransform: {
        enable: true
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: process.env.NODE_ENV==='development'?'/':'./',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    devServer: {
      port: 3000,
      proxy: {
        '/app/**': {
          target:'https://www.zhuanjuan.net',
          changeOrigin: true
        },
        '/upload/**': {
          target:'https://www.zhuanjuan.net',
          changeOrigin: true
        },
        '/api/**': {
          target:'https://www.zhuanjuan.net',
          changeOrigin: true
        },
        '/connect/**':{
          target:'https://open.weixin.qq.com',
          changeOrigin: true
        },
        '/sns/**':{
          target:'https://api.weixin.qq.com',
          changeOrigin: true
        }
      }
    },
    // router: {
    //   mode: 'browser'
    // }
  }
}

module.exports = function (merge) {
  
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
