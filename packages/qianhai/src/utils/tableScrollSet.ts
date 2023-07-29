import { useState, useEffect } from 'react';
/**
 *
 * @param tableData 表格数据
 * @param setScrollObj  useState(scrollObj)
 * @param scrollObj protable的scroll配置
 * @param correctHeight 修正高度
 */
interface scrollObjType {
  x?: string | number;
  y?: string | number;
}
export function useScrollObj(tableData = [], initScrollObj: scrollObjType = { x: 1000 }) {
  const [scrollObj, setScrollObj] = useState<scrollObjType>();
  useEffect(() => {
    const setScroll = () => {
      if (!tableData || !tableData.length) return;
      const antLayoutTop = document
        .querySelector('.ant-layout-content')!
        .getBoundingClientRect().top; // 内容区域距顶部的距离
      const tableTop = document.querySelector('.ant-table-wrapper')!.getBoundingClientRect().top; // 表格跟顶部的距离
      const correctHeight = tableTop - antLayoutTop + 5;

      // 获取数据后判断高度是否需要出现滚动条
      // setTimeout(() => {
      //   setPageSize(
      //     // Math.floor((document.querySelector('.ant-table-container')!.clientHeight + 5) / 56 - 1),
      //     Math.floor((document.querySelector('.sysScrollbg')!.clientHeight + 10) / 56 - 2),
      //   );
      // }, 50);

      if (
        document.querySelector('.ant-layout-content')!.clientHeight - correctHeight <
        (tableData.length + 2) * 56
      ) {
        setScrollObj({
          ...initScrollObj,
        });
      } else {
        setScrollObj({
          x: initScrollObj.x,
        });
      }
    };

    setScroll();
    window.addEventListener('resize', setScroll);

    return () => {
      window.removeEventListener('resize', setScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);
  return scrollObj;
}
export function useScrollObjSta(tableData = [], initScrollObj: scrollObjType = { x: 1000 }) {
  const [scrollObj, setScrollObj] = useState<scrollObjType>();
  useEffect(() => {
    const setScroll = () => {
      if (!tableData.length) return;
      const antLayoutTop = document
        .querySelector('.ant-layout-content')!
        .getBoundingClientRect().top; // 内容区域距顶部的距离
      const tableTop = document.querySelector('.ant-table-wrapper')!.getBoundingClientRect().top; // 表格跟顶部的距离
      const correctHeight = tableTop - antLayoutTop + 5;

      // 获取数据后判断高度是否需要出现滚动条
      // setTimeout(() => {
      //   setPageSize(
      //     // Math.floor((document.querySelector('.ant-table-container')!.clientHeight + 5) / 56 - 1),
      //     Math.floor((document.querySelector('.sysScrollbg')!.clientHeight + 10) / 56 - 2),
      //   );
      // }, 50);

      if (
        document.querySelector('.ant-layout-content')!.clientHeight - correctHeight <
        (tableData.length + 2) * 56 + 10
      ) {
        setScrollObj({
          ...initScrollObj,
        });
      } else {
        setScrollObj({
          x: initScrollObj.x,
        });
      }
    };

    setScroll();
    window.addEventListener('resize', setScroll);

    return () => {
      window.removeEventListener('resize', setScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);
  return scrollObj;
}

export function useScrollQueObj(tableData = [], initScrollObj: scrollObjType = { x: 1000 }) {
  const [scrollObj, setScrollObj] = useState<scrollObjType>();
  useEffect(() => {
    const setScroll = () => {
      if (!tableData?.length) return;
      const antLayoutTop = document
        .querySelector('.ant-layout-content')!
        .getBoundingClientRect().top; // 内容区域距顶部的距离
      const tableTop = document.querySelector('.ant-table-wrapper')!.getBoundingClientRect().top; // 表格跟顶部的距离
      const correctHeight = tableTop - antLayoutTop + 5;
      if (
        document.querySelector('.ant-layout-content')!.clientHeight - correctHeight <
        (tableData.length + 2) * 56 + 10
      ) {
        setScrollObj({
          ...initScrollObj,
        });
      } else {
        setScrollObj({
          x: initScrollObj.x,
        });
      }
    };

    setScroll();
    window.addEventListener('resize', setScroll);

    return () => {
      window.removeEventListener('resize', setScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);
  return scrollObj;
}
export function useDiseaseScrollObj(tableData = [], initScrollObj: scrollObjType = { x: 1000 }) {
  const [scrollObj, setScrollObj] = useState<scrollObjType>();
  useEffect(() => {
    const setScroll = () => {
      if (!tableData.length) return;
      const antLayoutTop = document
        .querySelector('.ant-layout-content')!
        .getBoundingClientRect().top; // 内容区域距顶部的距离
      const tableTop = document.querySelector('.ant-table-wrapper')!.getBoundingClientRect().top; // 表格跟顶部的距离
      const correctHeight = tableTop - antLayoutTop;

      if (
        document.querySelector('.ant-layout-content')!.clientHeight - correctHeight <
        tableData.length * 72 + 112 - 20
      ) {
        setScrollObj({
          ...initScrollObj,
        });
      } else {
        setScrollObj({
          x: initScrollObj.x,
        });
      }
    };

    setScroll();
    window.addEventListener('resize', setScroll);

    return () => {
      window.removeEventListener('resize', setScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);
  return scrollObj;
}
export function useDiseaseCardScrollObj(
  tableData = [],
  initScrollObj: scrollObjType = { x: 1000 },
) {
  const [scrollObj, setScrollObj] = useState<scrollObjType>();
  useEffect(() => {
    const setScroll = () => {
      if (!tableData.length) return;

      if (document.querySelector('.scrollBox')!.clientHeight - 360 < tableData.length * 72) {
        setScrollObj({
          ...initScrollObj,
        });
      } else {
        setScrollObj({
          x: initScrollObj.x,
        });
      }
    };

    setScroll();
    window.addEventListener('resize', setScroll);

    return () => {
      window.removeEventListener('resize', setScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);
  return scrollObj;
}
export function useCarListScrollObj(tableData = [], initScrollObj: scrollObjType = { x: 1000 }) {
  const [scrollObj, setScrollObj] = useState<scrollObjType>();
  useEffect(() => {
    const setScroll = () => {
      if (!tableData.length) return;
      if (!document.querySelector('.cardCars')) {
        return;
      }
      if (document.querySelector('.cardCars')!.clientHeight - 47 - 42 < tableData.length * 32) {
        const allheight: any = document.querySelector('.cardCars')!.clientHeight;
        const tabheight = allheight - 47 - 42 - 20 - 30;
        setScrollObj({
          x: initScrollObj.x,
          y: tabheight,
        });
      } else {
        setScrollObj({
          x: initScrollObj.x,
        });
      }
    };

    setScroll();
    window.addEventListener('resize', setScroll);

    return () => {
      window.removeEventListener('resize', setScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);
  return scrollObj;
}

export function useTop5ListScrollObj(tableData = [], initScrollObj: scrollObjType = { x: 1000 }) {
  const [scrollObj, setScrollObj] = useState<scrollObjType>();
  useEffect(() => {
    const setScroll = () => {
      if (!tableData.length) return;
      if (!document.querySelector('.viewTop5TableClass')) {
        return;
      }
      if (
        document.querySelector('.viewTop5TableClass')!.clientHeight - 42 <
        tableData.length * 32
      ) {
        const allheight: any = document.querySelector('.viewTop5TableClass')!.clientHeight;
        const tabheight = allheight - 52;
        setScrollObj({
          x: initScrollObj.x,
          y: tabheight,
        });
      } else {
        setScrollObj({
          x: initScrollObj.x,
        });
      }
    };

    setScroll();
    window.addEventListener('resize', setScroll);

    return () => {
      window.removeEventListener('resize', setScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);
  return scrollObj;
}
// 查询具体某块区域的高度是否加滚动条
export function useCommonScrollObj(
  paddingHeight: any,
  className: any,
  tableData = [],
  initScrollObj: scrollObjType = { x: 1000 },
) {
  const [scrollObj, setScrollObj] = useState<scrollObjType>();
  useEffect(() => {
    const setScroll = () => {
      if (!tableData.length) return;
      if (
        document.querySelector(className)!.clientHeight - paddingHeight <
        (tableData.length + 2) * 56 + 10
      ) {
        setScrollObj({
          ...initScrollObj,
        });
      } else {
        setScrollObj({
          x: initScrollObj.x,
        });
      }
    };

    setScroll();
    window.addEventListener('resize', setScroll);

    return () => {
      window.removeEventListener('resize', setScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);
  return scrollObj;
}
