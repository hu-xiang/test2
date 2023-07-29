import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { message, notification } from 'antd';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
// import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';
// import { getmenuall } from './services/ant-design-pro/api';
import { loginPath, layoutConfig } from './app-common';
import { getTokenName } from './utils/commonMethod';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  menuinfo?: API.CurrentUser;
  uploadModal?: boolean;
  fileStatusList?: any[];
  // isTenant?: boolean;
  // isChangePwd?: boolean;
  refreshUploadPage?: boolean;
  fileLibraryId?: any;
  diseaseTypes?: any[];
  cancelUploadFun?: (flag: boolean) => void;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  fetchmenuInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  // const fetchUserInfo = async () => {
  //   try {
  //     const currentUser = await queryCurrentUser();
  //     return currentUser;
  //   } catch (error) {
  //     //  history.replace({
  //     //   pathname: loginPath,
  //     //   search: stringify({
  //     //     redirect: history.location.pathname,
  //     //   }),
  //     // });
  //   }
  //   return undefined;
  // };
  // const fetchmenuInfo = async () => {
  //   try {
  //     const menuinfo = await getmenuall();
  //     return menuinfo;
  //   } catch (error) {
  //     // history.push(loginPath);
  //     return undefined;
  //   }
  // };
  // 如果是登录页面，不执行
  if (history.location.pathname !== loginPath) {
    // const currentUser = await fetchUserInfo();
    // const menuinfo = await fetchmenuInfo();
    return {
      // fetchUserInfo,
      // currentUser,
      // fetchmenuInfo,
      // menuinfo,
      settings: {},
    };
  }
  return {
    // fetchUserInfo,
    // fetchmenuInfo,
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
function requestInterceptors(url: any, options: any) {
  const tk = getTokenName();
  const headers: any = {
    'zhsq-client-type': '0',
    Authorization: localStorage.getItem(tk) || '',
    ...options.headers,
  };
  return {
    options: { ...options, headers },
  };
}

async function responseInterceptors(response: any) {
  // 登录页不进行操作
  if (history.location.pathname !== loginPath) {
    const data = await response.clone();
    message.config({
      maxCount: 1,
      duration: 2,
    });
    if (data && data.status === 401) {
      // const { pathname } = history.location;

      // message.warning({
      //   content: '登录会话已过期，请重新登录！',
      //   key: '登录会话已过期，请重新登录！',
      // });
      const tk = getTokenName();
      localStorage.removeItem(tk);
      localStorage.removeItem('isTenant');
      localStorage.removeItem('user&facId');
      // 刷新页面 不校验登录状态 直接到大屏展示界面
      // history.replace({
      //   pathname: loginPath,
      // });
    } else if (data && data.status === 403) {
      message.warning({
        content: '无访问权限！',
        key: '无访问权限！',
      });
      history.push('/403');
    }
  }
  return response;
}

export const request: RequestConfig = {
  prefix: `${BASE_API}/api`,
  requestInterceptors: [requestInterceptors],
  responseInterceptors: [responseInterceptors],
  errorHandler: (error: any) => {
    const { response } = error;
    if (!response) {
      notification.config({
        maxCount: 1,
      });
      notification.error({
        description: '您的网络发生异常，无法连接服务器',
        message: '网络异常',
      });
    }
    throw error;
  },
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }: any) => {
  return layoutConfig(initialState);
};
