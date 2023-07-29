/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  dev: {
    // '/task/': {
    //   target: 'http://10.80.22.120:8760',
    //   changeOrigin: true,
    //   pathRewrite: { '^': '' },
    // },
    // '/library': {
    //   target: 'http://10.80.22.120:8760',
    //   changeOrigin: true,
    //   pathRewrite: { '^': '' },
    // },
    // '/img': {
    //   target: 'http://10.80.22.120:8760',
    //   changeOrigin: true,
    //   pathRewrite: { '^': '' },
    // },
    // '/task': {
    //   target: 'http://10.80.22.120:8760',
    //   changeOrigin: true,
    //   pathRewrite: { '^': '' },
    // },
  },
  test: {
    // '/library': {
    //   target: 'http://10.80.22.120:8760',
    //   changeOrigin: true,
    //   pathRewrite: { '^': '' },
    // },
  },
  pre: {
    // '/api': {
    //   target: 'http://10.80.22.120:8760',
    //   changeOrigin: true,
    //   pathRewrite: { '^': '' },
    // },
  },
};
