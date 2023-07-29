/*
 * @Author: wf
 * @Date: 2022-12-09 10:40:54
 * @Last Modified by:   wf
 * @Last Modified time: 2022-12-09 10:40:54
 * @Description : 树形多选框，带全部字段的根节点
 */

import React, { useEffect, useState } from 'react';
import { TreeSelect } from 'antd';

function MultiTreeSelect<
  ValueType extends { key?: string; label: React.ReactNode; value: string | number; level: number },
>({ ...props }: any) {
  const defaultExpandedKeys = ['10000'];
  // const parentNodes = [1001, 1002, 1003];
  const [selectKeys, setSelectKeys] = useState<any>([]);
  const {
    handletreeselect,
    customclassName = null,
    parentNodes,
    treeListData,
    selectData,
    todo,
  } = props;

  const [treeList, setTreeList] = useState<any>();

  const getChildren = (val: any) => {
    const rec: any = [];
    const dg = (arr: any) => {
      if (!arr || !arr?.length) {
        return;
      }
      arr.forEach((i: any) => {
        if (i.value !== '10000' && !parentNodes?.includes(i.value)) {
          rec.push(i?.value);
        } else {
          /* eslint-disable */
          if (i.children && i.children.length > 0) {
            dg(i.children);
          }
        }
      });
      return rec;
    };
    let recItem: any = [];
    treeList.forEach((it: any) => {
      if (it.value === val) {
        recItem.push(it);
        return;
      }
      if (it?.children && it?.children.length > 0) {
        let frec = it?.children.find((m: any) => m.value === val);
        if (frec) {
          recItem.push(frec);
        }
      }
    });
    if (recItem && recItem?.length > 0) {
      dg(recItem);
    }
    return rec;
  };
  const getChildrenNodes = (value: any) => {
    let arr: any = [];
    if (value?.length > 0) {
      value.forEach((it: any) => {
        if (it === '10000' || parentNodes?.includes(it)) {
          const recValue = getChildren(it);
          arr = [...arr, ...recValue];
        } else {
          arr.push(it);
        }
      });
      return arr;
    }
    return [];
  };
  const handleChange = (text: any, option: any) => {
    const keys = getChildrenNodes(text);
    setSelectKeys(keys);
    handletreeselect(keys);
  };
  useEffect(() => {
    // console.log('object',urgency);
    const selData = todo === 'edit' ? selectData : [];
    setSelectKeys(selData);
  }, [selectData]);
  useEffect(() => {
    setTreeList(treeListData);
  }, [treeListData]);
  // const clearFunc = (flag: any) => {
  //   if (flag) {
  //     setSelectKeys([]);
  //   }
  // };
  // useImperativeHandle(ref, () => ({
  //   // 暴露给父组件的方法
  //   clearFunc,
  // }));

  return (
    <TreeSelect<ValueType>
      treeData={treeList}
      value={selectKeys}
      className={`${customclassName}`}
      popupClassName={'search-treeselect-dropdown'}
      maxTagCount={'responsive'}
      onChange={handleChange}
      allowClear={true}
      treeCheckable="true"
      treeDefaultExpandedKeys={defaultExpandedKeys}
      showCheckedStrategy="SHOW_PARENT"
      placeholder="请选择道路名称"
      style={{
        marginRight: 0,
      }}
    />
  );
}
export default MultiTreeSelect;
