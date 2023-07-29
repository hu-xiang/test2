import { TreeSelect } from 'antd';
import { useEffect, useImperativeHandle, useState } from 'react';
import { getDictData } from '../../../src/utils/commonMethod';

function TreeMutiSelect<
  ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any,
>({ ...props }: any) {
  const defaultExpandedKeys = [10000];

  // 最后选中需要查询的key集合
  const [keys, setKeys] = useState<any>([]);
  // 请求到的所有的树形数据
  const {
    selectedAll = false,
    handletreeselect,
    onRef,
    urgency = 2,
    isClear,
    customclassName = null,
    popupClassName = 'search-treeselect-dropdown',
    placeholder,
    importTreeData,
    params = {
      dictCodes: ['safe_event', 'cement', 'asphalt'],
      requiredUnknownDisease: false, // 是否需要-1类型
    },
    ...others
  } = props;

  // 最终需要显示的树形数据
  const [treeData, setTreeData] = useState<any>([]);

  const getAllTree = (level: number) => {
    /* eslint  no-async-promise-executor: 0 */
    return new Promise(async (resolve) => {
      const res = await getDictData({
        type: 1,
        dictCodes: params?.dictCodes,
        level,
        requiredUnknownDisease: params?.requiredUnknownDisease,
      });
      resolve(res || []);
    });
  };

  const formatTreeChildren = (list: any, preValues: any) => {
    list?.forEach((item: any) => {
      if (item?.children && item?.children?.length) {
        formatTreeChildren(item?.children, preValues);
      } else {
        preValues?.push(item?.value);
      }
    });
    return preValues;
  };

  const formatTreeValues = (list: any, selectedVals: any, preValues: any) => {
    list?.forEach((item: any) => {
      if (selectedVals?.includes(item?.value) && item?.children && item?.children?.length) {
        const arr = formatTreeChildren(item?.children, []);
        preValues?.push(...arr);
      } else if (
        selectedVals?.includes(item?.value) &&
        (!item?.children || !item?.children?.length)
      ) {
        preValues?.push(item?.value);
      } else if (!selectedVals?.includes(item?.value) && item?.children && item?.children?.length) {
        formatTreeValues(item?.children, selectedVals, preValues);
      }
    });
    return preValues;
  };

  const formatValues = (val: any) => {
    let values: any = [];
    if (val?.length) {
      values = formatTreeValues(treeData, val, []);
    }
    return values;
  };

  const handleDiseaseType = (value: any) => {
    const keyArr: any = formatValues(value);
    setKeys(keyArr);
    const values = keyArr?.map((item: any) => {
      return item?.split('*')[0];
    });
    handletreeselect(values);
  };

  const formatTreeData = (list: any) => {
    list?.forEach((item: any) => {
      item.title = item?.dictName;
      item.value = `${item?.dictKey}*${item?.dictCode}`;
      if (item?.children && item?.children?.length) {
        formatTreeData(item?.children);
      }
    });
    return list;
  };

  useEffect(() => {
    // 0 非紧急1 紧急
    let timer: any = null;
    if (importTreeData?.length) {
      setTreeData(importTreeData);
    } else {
      timer = setTimeout(() => {
        getAllTree(urgency).then((res: any) => {
          let treeArr: any = [];
          if (res?.length) {
            treeArr = [
              {
                title: '全部',
                value: 10000,
                key: 10000,
                children: [...formatTreeData(res)],
              },
            ];
          }
          setTreeData([...treeArr]);
        });
      }, 0);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [urgency, importTreeData]);

  useEffect(() => {
    if (selectedAll && treeData.length) {
      const allKeys = formatValues([10000]);
      setKeys(allKeys);
    }
  }, [treeData]);

  const clearFunc = (flag: any) => {
    if (flag) {
      setKeys([]);
    }
  };
  useImperativeHandle(onRef, () => ({
    // 暴露给父组件的方法
    clearFunc,
  }));

  return (
    <TreeSelect<ValueType>
      treeData={treeData}
      value={keys}
      className={`${customclassName}`}
      popupClassName={`${popupClassName}`}
      maxTagCount={'responsive'}
      {...others}
      onChange={handleDiseaseType}
      allowClear={true}
      treeCheckable="true"
      treeDefaultExpandedKeys={defaultExpandedKeys}
      showCheckedStrategy="SHOW_PARENT"
      placeholder={placeholder || '请选择病害类型'}
      style={{
        marginRight: 0,
        width: '100%',
      }}
    />
  );
}
export default TreeMutiSelect;
