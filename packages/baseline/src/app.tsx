import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
// import { message } from 'antd';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';
import { getmenuall, freeLogin } from './services/ant-design-pro/api';
import { getTokenName } from './utils/commonMethod';
import {
  loginPath,
  layoutConfig,
  responseInterceptors,
  requestInterceptors,
  globalErrorHandler,
} from './app-common';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
const url = window.location.href;
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  menuinfo?: API.CurrentUser;
  uploadModal?: boolean;
  fileStatusList?: any[];
  refreshUploadPage?: boolean;
  // fileLibraryId?: any;
  otherParams?: any;
  PDiseaseTypes?: any[];
  diseaseTypes?: any[];
  cancelUploadFun?: (flag: boolean) => void;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  fetchmenuInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  if (url?.indexOf('/defaultLogin') > 0 && Platform_Flag === 'meiping') {
    try {
      // 登录
      const password =
        BASE_API?.indexOf('visharp.traffic.smartmore.com/tn') > 0
          ? 'aVoEVA68qSeTQ6emmasvug=='
          : 'FJ0ajK+1LGox4zCRcx+YDQ==';
      const username =
        BASE_API?.indexOf('visharp.traffic.smartmore.com/tn') > 0 ? 'mpgs' : 'mpgsadmin';
      const res: any = await freeLogin({ username, password });
      if (res.status === 0) {
        const tokenName = getTokenName();
        localStorage.setItem(tokenName, res.data?.accessToken || '');
        sessionStorage.setItem('changePwd', res.data?.isChangePw);
        localStorage.setItem('isTenant', res?.data?.isTenant.toString());
        localStorage.setItem('current-tenantId', res?.data?.info?.tenantId);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchUserInfo = async () => {
    try {
      const currentUser = await queryCurrentUser();
      return currentUser;
    } catch (error) {
      //  history.replace({
      //   pathname: loginPath,
      //   search: stringify({
      //     redirect: history.location.pathname,
      //   }),
      // });
    }
    return undefined;
  };
  const fetchmenuInfo = async () => {
    try {
      const menuinfo = await getmenuall();
      return menuinfo;
    } catch (error) {
      // history.push(loginPath);
      return undefined;
    }
  };
  // 如果是登录页面，不执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    const menuinfo = await fetchmenuInfo();
    return {
      fetchUserInfo,
      currentUser,
      fetchmenuInfo,
      menuinfo,
      settings: {},
    };
  }
  return {
    fetchUserInfo,
    fetchmenuInfo,
    settings: {},
  };
}

/**
 * 异常处理程序
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    405: '请求方法不被允许。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
 //-----English
    200: The server successfully returned the requested data. ',
    201: New or modified data is successful. ',
    202: A request has entered the background queue (asynchronous task). ',
    204: Data deleted successfully. ',
    400: 'There was an error in the request sent, and the server did not create or modify data. ',
    401: The user does not have permission (token, username, password error). ',
    403: The user is authorized, but access is forbidden. ',
    404: The request sent was for a record that did not exist. ',
    405: The request method is not allowed. ',
    406: The requested format is not available. ',
    410':
        'The requested resource is permanently deleted and will no longer be available. ',
    422: When creating an object, a validation error occurred. ',
    500: An error occurred on the server, please check the server. ',
    502: Gateway error. ',
    503: The service is unavailable. ',
    504: The gateway timed out. ',
 * @see https://beta-pro.ant.design/docs/request-cn
 */

export const request: RequestConfig = {
  prefix: `${BASE_API}/api`,
  requestInterceptors: [requestInterceptors],
  responseInterceptors: [responseInterceptors],
  errorHandler: globalErrorHandler,
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }: any) => {
  return layoutConfig(initialState);
};
