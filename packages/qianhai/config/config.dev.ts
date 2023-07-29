// https://umijs.org/config/
import { defineConfig } from 'umi';

export default defineConfig({
  plugins: [
    // https://github.com/zthxxx/react-dev-inspector
    'react-dev-inspector/plugins/umi/react-inspector',
  ],
  // https://github.com/zthxxx/react-dev-inspector#inspector-loader-props
  inspectorConfig: {
    exclude: [],
    babelPlugins: [],
    babelOptions: {},
  },
  define: {
    BASE_API: 'http://10.81.204.79/dev',
    // BASE_API: 'http://10.81.209.31:8765',
    // BASE_API: 'http://visharp.traffic.smartmore.com/sharp',
    // BASE_API: 'http://visharp.traffic.smartmore.com/vgame/',
    // BASE_API: 'http://visharp.traffic.smartmore.com/tn',
  },
});
