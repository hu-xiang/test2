import { message, Modal } from 'antd';
import { useRef, useMemo, useState } from 'react';
import { isEqual } from 'lodash';
import type { MenuProps } from 'antd';
import { useAccess, request } from 'umi';
import { exportCom } from './exportCom';
// import { ExclamationCircleOutlined } from '@ant-design/icons';

type MenuItem = Required<MenuProps>['items'][number];
const { confirm } = Modal;

export function getTokenName() {
  const locationName = window.location?.pathname;
  const newToken: string = locationName.replaceAll('/', '');
  return `token-${newToken || 'base'}`;
}

export function serviceError(error: any) {
  message.error({
    content: error.message,
  });
}

/**
 * 用于useEffect|useCallback|useMemo依赖为引用类型时，避免数据未变重复渲染
 * @param val 数组或对象
 * @returns 缓存的值
 */
export function useCompare(val: any) {
  const compareRef = useRef<any>(null);
  if (!isEqual(compareRef.current, val)) {
    compareRef.current = val;
  }
  return compareRef.current;
}

/**
 * 用于表单中的menu展开
 */
export const getMenuItem = (
  label: React.ReactNode,
  key: React.Key,
  disabled?: boolean,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem => {
  return {
    key,
    icon,
    children,
    label,
    type,
    disabled,
  } as MenuItem;
};

/**
 * 用于获取今天日期的YYYY-MM-DD类型的字符串
 */
export const formatNowTime = (format: any = 'YYYY-MM-DD') => {
  const time = new Date();
  let newformat = format;
  let strMonth: string | number = time.getMonth() + 1;
  let strDay: string | number = time.getDate();
  if (strMonth < 10) {
    strMonth = `0${strMonth}`;
  }
  if (strDay < 10) {
    strDay = `0${strDay}`;
  }
  const config = {
    YYYY: time.getFullYear(),
    MM: strMonth,
    DD: strDay,
  };
  Object.keys(config).forEach((it: any) => {
    newformat = newformat.replace(it, config[it]);
  });
  return newformat;
};

/**
 * 用于获取前一天日期的YYYY-MM-DD类型的字符串
 */
export const formatYesterday = (format: any = 'YYYY-MM-DD') => {
  const now = new Date();
  const time = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  let newformat = format;
  let strMonth: string | number = time.getMonth() + 1;
  let strDay: string | number = time.getDate();
  if (strMonth < 10) {
    strMonth = `0${strMonth}`;
  }
  if (strDay < 10) {
    strDay = `0${strDay}`;
  }
  const config = {
    YYYY: time.getFullYear(),
    MM: strMonth,
    DD: strDay,
  };
  Object.keys(config).forEach((it: any) => {
    newformat = newformat.replace(it, config[it]);
  });
  return newformat;
};

/**
 * 判断是否有表格上面操作按钮权限，给特定样式
 */
export const isExist = (list: any = []) => {
  const rec = list.some((it: string) => {
    if (useAccess()[it]) {
      return true;
    }
    return false;
  });
  return rec;
};

/**
 * 接口请求方法
 */
export const commonRequest = async (
  obj: any = { url: '', method: 'GET', blob: false, params: {}, isTable: false, isParams: false },
) => {
  const config: any = {
    method: obj?.method?.toUpperCase(),
  };
  if (obj?.blob) Object.assign(config, { responseType: 'blob', getResponse: true });
  if (obj.hasOwnProperty('headers')) Object.assign(config, { headers: obj?.headers });
  if (config.method === 'GET' || obj?.isParams) Object.assign(config, { params: obj?.params });
  else Object.assign(config, { data: obj?.params });
  const res: any = await request(obj?.url, config);
  if (obj?.isTable)
    return {
      data: res?.data instanceof Array ? res?.data : res?.data?.rows,
      success: true,
      total: res?.data?.total || res?.data?.length,
    };
  return res;
};

/**
 * 导出
 */
export const commonExport = async (params: any, type = '', fileName = '') => {
  const hide = message.loading({
    content: '正在导出',
    key: '正在导出',
  });
  try {
    const res: any = await commonRequest(params);
    hide();
    if (type) {
      exportCom(res, undefined, type);
    } else if (fileName) {
      exportCom(res, fileName);
    } else {
      exportCom(res);
    }
    message.success({
      content: '导出成功',
      key: '导出成功',
    });
  } catch (error) {
    hide();
    message.error({
      content: '导出失败!',
      key: '导出失败!',
    });
  }
};

export const commonDel = async (
  title: any,
  params: any,
  actionName: string = '删除',
  isError: Boolean = false,
) => {
  return new Promise((resolve) => {
    confirm({
      title,
      // icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      zIndex: 1100,
      cancelText: '取消',
      async onOk() {
        const hide = message.loading({
          content: `正在${actionName}`,
          key: `正在${actionName}`,
        });
        try {
          const res = await commonRequest(params);
          hide();
          if (res.status === 0) {
            message.success({
              content: `${actionName}成功`,
              key: `${actionName}成功`,
            });
            resolve(true);
          } else if (isError && res.status !== 0) {
            message.warning({
              content: `${res?.message}`,
              key: `${res?.message}`,
            });
            resolve(false);
          }
          resolve(false);
        } catch (error) {
          hide();
          message.error({
            content: `${actionName}失败`,
            key: `${actionName}失败`,
          });
          resolve(false);
        }
      },
      onCancel() {
        resolve(false);
      },
    });
  });
};

// 做小数运算后的结果转换为带两位小数点的浮点数,NUM:传入数值，转化带几位的小数点
export const toFloat = (val: number, n: number) => {
  return val ? parseFloat(val.toPrecision(12)).toFixed(n) : 0;
};

/**
 * 调整表格滚动条的位置
 * @param curIndex 表格需要出现在可见区域的索引
 * */

export const changeTableScrollBarPosition = (curIndex: number) => {
  const antTableBody = document.querySelector('.ant-table-body');
  if (antTableBody) {
    const tbodyClientHeight = antTableBody!.clientHeight;
    const tdHeight = antTableBody!.querySelector('.ant-table-cell')!.scrollHeight;
    const visibleRows = Math.floor(tbodyClientHeight / tdHeight); // 可见行数
    // 当在可见区域内不滚动，滚动会显得突兀
    if (document.querySelector('.highlight-row')) {
      const rowTop = document.querySelector('.highlight-row')!.getBoundingClientRect().top;
      if (rowTop <= (visibleRows - 1) * tdHeight || rowTop >= 360 + visibleRows * tdHeight) {
        antTableBody!.scrollTop = curIndex * tdHeight;
      }
    } else {
      antTableBody!.scrollTop = curIndex * tdHeight;
    }
  }
};

/**
 * 获取字典数据
 * @param {object} params
 * @param {number} params.type 1-查树形 2-查单层
 *  dictCodes: -1全部；[]父级字典code, 查父级字典下的子级字典
 *  scenesType 0: 非定制模块，不过滤， 1：过滤特定病害类型
 *  dictFilterCodes: [],   type为2时过滤字典参数
 *  level: 1, type为1时字典紧急程度参数0 非紧急1 紧急
 *  requiredUnknownDisease: true, type为1时是否需要-1类型
 * @returns {Promise} dictData
 * */
export const getDictData = (
  params: any = {
    type: 1,
    dictCodes: [],
    scenesType: '',
    level: 2,
    dictFilterCodes: [],
    requiredUnknownDisease: false,
    tenantId: undefined,
  },
) => {
  const url = params?.type * 1 === 1 ? '/admin/dict/getTree' : '/admin/dict/dictList';
  /* eslint  no-async-promise-executor: 0 */
  const dictData = new Promise(async (resolve) => {
    try {
      const res = await commonRequest({
        url,
        method: 'get',
        params:
          params?.type * 1 === 1
            ? {
                dictCodes: params?.dictCodes,
                scenesType: params?.scenesType,
                level: params?.level === 0 || params?.level === 1 ? params?.level : undefined,
                requiredUnknownDisease: params?.requiredUnknownDisease || undefined,
                tenantId: params?.tenantId,
              }
            : {
                dictCodeFilterList: params?.dictFilterCodes,
                parentCodeList: params?.dictCodes,
                scenesType: params?.scenesType,
              },
      });
      if (res.status === 0) {
        resolve(res?.data);
      }
      resolve(false);
    } catch (error) {
      resolve(false);
    }
  });
  return dictData;
};

/* eslint-disable */
export const averageFn = (arr: any = [], num: number = 10) => {
  let i = 0;
  let result = [];
  while (i < arr.length) {
    result.push(arr.slice(i, i + num));
    i = i + num;
  }
  return result;
};

export const use2DArrItem = (page: number, arr: any = []) => {
  if (page > arr.length - 1) {
    console.log('每一项都获取完了');
    return;
  }
  requestAnimationFrame(() => {
    arr[page].forEach((item: any) => {
      console.log(item);
    });
    page = page + 1;
    use2DArrItem(page, arr);
  });
};

export const concurrencyRequest = (urls: any, maxNum: number = 10) => {
  return new Promise((resolve) => {
    if (urls.length === 0) {
      resolve([]);
      return;
    }
    const results: any = [];
    let index = 0;
    let count = 0;

    async function request() {
      if (index === urls.length) return;
      const i = index;
      const url = urls[index];
      index++;
      console.log(url);
      try {
        const resp = await fetch(url);
        results[i] = resp;
      } catch (err) {
        results[i] = err;
      } finally {
        count++;
        if (count === urls.length) {
          console.log('完成了');
          resolve(results);
        }
        request();
      }
    }

    const times = Math.min(maxNum, urls.length);
    for (let i = 0; i < times; i++) {
      request();
    }
  });
};

export const useProxy = <T extends Record<string | symbol, any>>(state: T): T => {
  const [value, setValue] = useState<T | undefined>();

  // 数组
  // const createProxyArray = (targets: T): T => {

  //   return new Proxy(targets, {
  //     get: (target: T, key: keyof T, reciver) => {
  //       const res = Reflect.get(target, key, reciver)

  //       if (typeof res === 'object' && res !== null) {
  //         // 嵌套对象也设置代理对象
  //         const proxy = createProxyObject(res)
  //         return proxy
  //       }
  //       return res
  //     },
  //     set: (target, key: keyof T, value, reciver) => {
  //       // 基于原始数组重新设置新的代理数组
  //       setValue(createProxyArray(state))
  //       return Reflect.set(target, key, value, reciver)
  //     }
  //   })

  // }

  // const initVlaue = useMemo(() =>
  //   Array.isArray(state)
  //     ? createProxyArray(state)
  //     : createProxyObject(state)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // , [state])

  const createProxy = (targets: T): T => {
    return new Proxy(targets, {
      get: (target: T, key: keyof T, reciver) => {
        const res = Reflect.get(target, key, reciver);
        if (typeof res === 'object' && res !== null) {
          // 嵌套对象也设置代理对象
          return createProxy(res);
        }
        return res;
      },
      set: (target, key: keyof T, value, reciver) => {
        // 基于原始对象重新设置新的代理对象
        setValue(createProxy(state));
        return Reflect.set(target, key, value, reciver);
      },
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initVlaue = useMemo(() => createProxy(state), [state]);

  return value ?? initVlaue;
};
/* eslint-enable */
