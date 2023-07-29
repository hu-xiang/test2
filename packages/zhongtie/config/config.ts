// https://umijs.org/config/
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
    Platform_Flag: 'zhongtie',
  },
};
