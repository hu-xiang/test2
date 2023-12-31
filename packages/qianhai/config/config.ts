// // https://umijs.org/config/
// import { defineConfig } from 'umi';
// import { join } from 'path';
// import defaultSettings from './defaultSettings';
// import proxy from './proxy';
// import routes from './routes';
// import chainWebpack from '../../../config.common';

// const { REACT_APP_ENV } = process.env;
// const isProd = process.env.NODE_ENV === 'production';

// export default defineConfig({
//   hash: true,
//   antd: {},
//   history: {
//     // type: 'browser',
//     type: 'hash',
//   },
//   publicPath: './',
//   dva: {
//     hmr: true,
//   },
//   layout: {
//     // https://umijs.org/zh-CN/plugins/plugin-layout
//     locale: true,
//     siderWidth: 208,
//     ...defaultSettings,
//   },
//   // https://umijs.org/zh-CN/plugins/plugin-locale
//   locale: {
//     // default zh-CN
//     default: 'zh-CN',
//     antd: true,
//     // default true, when it is true, will use `navigator.language` overwrite default
//     baseNavigator: true,
//   },
//   dynamicImport: {
//     loading: '@ant-design/pro-layout/es/PageLoading',
//   },
//   targets: {
//     ie: 11,
//   },
//   // umi routes: https://umijs.org/docs/routing
//   routes,
//   // Theme for antd: https://ant.design/docs/react/customize-theme-cn
//   theme: {
//     'primary-color': defaultSettings.primaryColor,
//   },
//   // esbuild is father build tools
//   // https://umijs.org/plugins/plugin-esbuild
//   esbuild: {},
//   title: false,
//   ignoreMomentLocale: true,
//   proxy: proxy[REACT_APP_ENV || 'dev'],
//   manifest: {
//     basePath: '/',
//   },
//   // Fast Refresh 热更新
//   fastRefresh: {},
//   // openAPI: [
//   //   {
//   //     requestLibPath: "import { request } from 'umi'",
//   //     // 或者使用在线的版本
//   //     // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
//   //     schemaPath: join(__dirname, 'oneapi.json'),
//   //     mock: false,
//   //   },
//   //   {
//   //     requestLibPath: "import { request } from 'umi'",
//   //     schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
//   //     projectName: 'swagger',
//   //   },
//   // ],
//   extraBabelPlugins: isProd ? ['babel-plugin-transform-remove-console'] : [],
//   // chainWebpack(memo, { env, webpack, createCSSRule }) {
//   //   chainWebpack(memo, join);
//   // },
//   nodeModulesTransform: {
//     type: 'none',
//   },
//   // mfsu: {}, // 用mfsu方式 通过安装依赖引入其它项目组件，会打包失败
//   webpack5: {},
//   exportStatic: {},
//   cssLoader: {
//     localsConvention: 'camelCase',
//   },
//   define: {
//     BASE_API: 'http://visharp.traffic.smartmore.com/sharp',
//   },
// });

import routes from './routes';
import { config } from '../../../config.common';

export default {
  ...config,
  // umi routes: https://umijs.org/docs/routing
  routes,
  // mfsu: {},  // 用mfsu方式 通过安装依赖引入其它项目组件，会打包失败
  webpack5: {}, // 此选项无法提取到公共配置，否则打包失败
  define: {
    ...config.define,
  },
};
