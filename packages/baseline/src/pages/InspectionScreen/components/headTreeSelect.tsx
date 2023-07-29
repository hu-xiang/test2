import { TreeSelect } from 'antd';
import { useEffect, useImperativeHandle, useState } from 'react';
import EmptyPage from '../../../components/EmptyPage';

function HeadTreeSelect<
  ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any,
>({ ...props }: any) {
  const defaultExpandedKeys = [10000];

  const [showArrow, setShowArrow] = useState<boolean>(true);

  // 最后选中需要查询的key集合
  const [keys, setKeys] = useState<any>([]);
  // 请求到的所有的树形数据
  const {
    selectedAll = true,
    handletreeselect,
    onRef,
    isClear,
    // customclassName = null,
    popupClassName = 'search-treeselect-dropdown',
    placeholder,
    importTreeData,
    ...others
  } = props;

  // 最终需要显示的树形数据
  const [treeData, setTreeData] = useState<any>([]);

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

  const handleSelectType = (value: any) => {
    const keyArr: any = formatValues(value);
    setKeys(keyArr);
    handletreeselect(keyArr);
  };

  const formatTreeData = (list: any) => {
    list?.forEach((item: any) => {
      item.title = item?.label;
      if (item?.children && item?.children?.length) {
        formatTreeData(item?.children);
      }
    });
    return list;
  };

  useEffect(() => {
    if (importTreeData?.length) {
      const treeArr = [
        {
          title: '全部',
          value: 10000,
          key: 10000,
          children: [...formatTreeData(importTreeData)],
        },
      ];
      setTreeData(treeArr);
    }
  }, [importTreeData]);

  useEffect(() => {
    if (selectedAll && treeData.length) {
      const allKeys = formatValues([10000]);
      handletreeselect(allKeys);
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
      showSearch={false}
      onMouseEnter={() => setShowArrow(false)}
      onMouseLeave={() => setShowArrow(true)}
      showArrow={showArrow}
      value={keys}
      // className={`${customclassName}`}
      /* eslint  no-template-curly-in-string: 0 */
      className={`${
        !showArrow
          ? 'searchHeadFacility treeSelectClass colorClear'
          : 'searchHeadFacility treeSelectClass'
      }`}
      popupClassName={`${popupClassName}`}
      maxTagCount={'responsive'}
      {...others}
      onChange={handleSelectType}
      allowClear={isClear}
      treeCheckable="true"
      treeDefaultExpandedKeys={defaultExpandedKeys}
      showCheckedStrategy="SHOW_PARENT"
      placeholder={placeholder || '搜索道路'}
      notFoundContent={<EmptyPage content={'暂无数据'} customEmptyChartClass={'selectEmpty'} />}
      style={{
        marginRight: 0,
        width: '100%',
      }}
    />
  );
}
export default HeadTreeSelect;
