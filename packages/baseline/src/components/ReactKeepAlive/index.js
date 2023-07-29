import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import KeepAlive, { AliveScope, useAliveController, useActivate } from 'react-activation';
import { treeToList } from './utils';
import useLatestFn from './useLatestFn';

let allFlatRoutes = [];
let keepAliveRoutes = [];
// let HISTORY_UNLISTEN = null;
let fromPathCache = ''; // 记录前一个页面

// 初始化 allFlatRoutes keepAliveRoutes
function initRoutes(routes) {
  allFlatRoutes = treeToList(routes); // 所有路由
  keepAliveRoutes = allFlatRoutes.filter((item) => item.meta?.keepAlive); // keepAlive的路由
}

// 判断props.children是否需要被 <KeepAlive> 包裹
function KeepAliveWrapper(props) {
  const location = useLocation();
  const curPath = location.pathname;
  const routeItem = keepAliveRoutes.find((item) => item.path === curPath);
  let dom = props.children;
  if (routeItem) {
    dom = (
      <KeepAlive
        id={curPath} // id 用于多个keepAlive // id 一定要加 否则 keepAlive的页面 跳转 另一个keepAlive的页面 会有问题
        name={curPath} // name 用于手动控制缓存
      >
        {props.children}
      </KeepAlive>
    );
  }
  return dom;
}

function useKeepAlive(paramType = 'detail') {
  const location = useLocation();
  // console.log('useKeepAlive111',location.pathname)
  const history = useHistory();
  const aliveController = useAliveController();

  // 清除keep alive缓存
  function clearKeepAlive(nameKey) {
    setTimeout(() => {
      try {
        // console.log('clearKeepAlive',nameKey)
        if (nameKey) {
          if (aliveController?.dropScope) {
            aliveController.dropScope(nameKey);
          }
        } else {
          /* eslint-disable */
          aliveController?.clear && aliveController.clear();
        }
        const cachingNodes = aliveController?.getCachingNodes();
        // console.log(`clearKeepAlive: ${cachingNodes},nameKey:${nameKey}`)
      } catch (e) {
        console.log(e);
      }
    }, 10);
  }

  const listenCallbackRef = useLatestFn((to, type) => {
    const toPath = to.pathname;
    const fromPath = fromPathCache || toPath;
    fromPathCache = toPath;
    if (paramType === 'detail') {
      // console.log('detail', fromPath,toPath,keepAliveRoutes)
      const routeItem = keepAliveRoutes.find((item) => item.path == fromPath); // from页面 是一个需要keepAlive的页面
      const curPathIsKeepAliveToPath_ParentItem = keepAliveRoutes.find((item) => {
        return (
          item.meta?.keepAlive?.toPath == fromPath || item.meta?.otherKeepAlive?.toPath == fromPath
        );
      }); // from页面 是一个 需要keepAlive的页面的toPath

      // 控制keepAlive缓存
      if (routeItem) {
        // console.log('from页面 是一个detail需要keepAlive的列表页面', routeItem.meta?.keepAlive.toPath)
        if (
          toPath === routeItem.meta?.keepAlive.toPath ||
          toPath === routeItem.meta?.otherKeepAlive?.toPath
        ) {
          console.log('toPath 正好是当前这个路由的 keepAlive.toPath');
        } else {
          // console.log('清除缓存节点', fromPath);
          clearKeepAlive(fromPath);
        }
      }

      // from页面 是一个 需要keepAlive的页面的toPath,这种情况是详情后还有详情页需要缓存
      if (curPathIsKeepAliveToPath_ParentItem) {
        // console.log('from页面 是某个keepAlive的页面 的toPath')
        if (curPathIsKeepAliveToPath_ParentItem.path === toPath) {
          console.log('curPath所去的 页面是 parentItem.path，不做什么');
        } else {
          // console.log('清除 parentItem.path keepAlive');
          console.log('curPath清除缓存节点', curPathIsKeepAliveToPath_ParentItem.path);
          clearKeepAlive(curPathIsKeepAliveToPath_ParentItem.path);
        }
      }
    } else if (paramType === 'tabs') {
      // console.log('dftabs')
      const routeItemTabs = keepAliveRoutes.find((item) => item.path == fromPath);
      if (routeItemTabs) {
        // console.log(`routeItemTabs:${JSON.stringify(routeItemTabs)}，routeItem.meta?.keepAlive.toPath：${routeItemTabs.meta?.keepAlive.toPath}`)
        if (toPath === routeItemTabs.meta?.keepAlive.toPath) {
          // console.log('tabs进来，什么也不做');
        } else {
          // console.log('清除tabs缓存节点', fromPath);
          clearKeepAlive(fromPath);
        }
      }
    }
  });

  useEffect(() => {
    // console.log('监听能进来',location.pathname);
    fromPathCache = location.pathname;
    const HISTORY_UNLISTEN = history.listen((to, type) => {
      // console.log('监听进来to的值',to)
      if (listenCallbackRef.current) {
        listenCallbackRef.current(to, type);
      }
    });
    return () => {
      if (HISTORY_UNLISTEN) {
        HISTORY_UNLISTEN();
      }
    };
  }, []);
}
/**
 *
 * activate 传参
 */

const KEEP_ALIVE_OPTIONS_KEY = (key) => {
  // return window.location.origin + '_KEEP_ALIVE_OPTIONS_KEY_' + key
  return `${window.location.origin}_KEEP_ALIVE_OPTIONS_KEY_${key}`;
};

// 页面activate的时候触发 一般就是从detail页返回，由于useActivate无法传参，改写了这个函数，在进入详情页时保存参数信息，在返回列表页时取出详情页的信息
function useActivateWithOptions(activatePageKey, callback) {
  useActivate(() => {
    console.log('useActivate钩子触发', activatePageKey);
    let options = {};
    try {
      const optionsJsonStr = localStorage.getItem(KEEP_ALIVE_OPTIONS_KEY(activatePageKey));
      const obj = JSON.parse(optionsJsonStr);
      if (Object.prototype.toString.call(obj) === '[object Object]') {
        options = obj;
        console.log('从detail页返回', JSON.stringify(obj), optionsJsonStr);
      }
    } catch {
      console.log('chuyichang');
    }
    localStorage.removeItem(KEEP_ALIVE_OPTIONS_KEY(activatePageKey)); // activatePageKey指定是给哪个keepAlive的页面传参
    if (callback) {
      callback(options);
    }
  });
}

function setActivateOptions(activatePageKey, options = {}) {
  const optionsJsonStr = JSON.stringify(options);
  localStorage.setItem(KEEP_ALIVE_OPTIONS_KEY(activatePageKey), optionsJsonStr);
}

export {
  initRoutes,
  AliveScope,
  KeepAliveWrapper,
  useKeepAlive,
  useActivateWithOptions as useActivate,
  setActivateOptions,
};
