import { join } from 'path';
import defaultSettings from './packages/baseline/config/defaultSettings';
import proxy from './packages/baseline/config/proxy';

const { REACT_APP_ENV } = process.env;
console.log(REACT_APP_ENV);
/**
 * 公用打包配置，在项目config/config.ts中配置
 * 对js的规则目录包含外部目录文件
 * chainWebpack
 */
export default function chainWebpack(memo) {
  memo.module
    .rule('js')
    .test(/\.(js|mjs|jsx|ts|tsx)$/)
    .include.add(join(__dirname, '../../'))
    .end()
    .exclude.add(/node_modules/)
    .end()
    .use('babel-loader');
}

const BuildTime = new Date().toLocaleString();
const GitVersion = require('child_process').execSync('git rev-parse HEAD').toString();

const isProd = process.env.NODE_ENV === 'production';

export const config = {
  hash: true,
  antd: {},
  history: {
    // type: 'browser',
    type: 'hash',
  },
  publicPath: './',
  dva: {
    hmr: true,
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  proxy: proxy[REACT_APP_ENV || 'dev'],
  extraBabelPlugins: isProd ? ['babel-plugin-transform-remove-console'] : [],
  // openAPI: [
  //   {
  //     requestLibPath: "import { request } from 'umi'",
  //     // 或者使用在线的版本
  //     schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json',
  //     // schemaPath: join(__dirname, 'oneapi.json'),
  //     mock: false,
  //   },
  //   {
  //     requestLibPath: "import { request } from 'umi'",
  //     schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
  //     projectName: 'swagger',
  //   },
  // ],
  // chainWebpack(memo, { env, webpack, createCSSRule })
  chainWebpack(memo) {
    chainWebpack(memo);
  },
  nodeModulesTransform: {
    type: 'none',
  },

  exportStatic: {},
  cssLoader: {
    localsConvention: 'camelCase',
  },
  webpack5: {},
  define: {
    BASE_API: 'http://visharp.traffic.smartmore.com/tn',
    Platform_Flag: '',
    BuildTime,
    GitVersion,
  },
};
