/*
 * @Author: wf
 * @Date: 2022-12-09 10:41:54
 * @Last Modified by: wf
 * @Last Modified time: 2022-12-09 10:42:26
 * @Description : 多选框，上边带全部和清除按钮
 */

import React, { useEffect, useState } from 'react';
import { TreeSelect, Divider } from 'antd';
import styles from './styles.less';

function NormalMultiSelect<
  ValueType extends {
    key?: string;
    label: React.ReactNode;
    value: string | number;
    level?: number;
  },
>({ ...props }: any) {
  // const defaultExpandedKeys = ['10000'];
  // const parentNodes = [1001, 1002, 1003];
  const [selectKeys, setSelectKeys] = useState<any>([]);
  const {
    handletreeselect,
    customclassName = '',
    placeholdContent = '请选择',
    treeListData,
    selectData,
    todo,
  } = props;

  const [treeList, setTreeList] = useState<any>();
  const [isCheckAll, setIsCheckAll] = useState<boolean>(false);

  const handleChange = (text: any) => {
    setSelectKeys(text);
    handletreeselect(text);
    setIsCheckAll(text?.length === treeListData?.length);
  };
  const handleCheckAll = () => {
    if (selectKeys?.length === treeListData?.length) {
      return;
    }
    setIsCheckAll(true);
    const newData: any[] = [];
    if (treeListData?.length) {
      treeListData.forEach((it: any) => {
        newData.push({ label: it?.label, value: it?.value });
      });
    }
    setSelectKeys(newData);
    handletreeselect(newData);
  };
  const handleClearAll = () => {
    setIsCheckAll(false);
    setSelectKeys([]);
    handletreeselect([]);
  };
  useEffect(() => {
    if (treeListData?.length > 0) {
      const selData = todo === 'proEdit' ? selectData : [];
      setSelectKeys(selData);
      if (treeListData?.length > 0 && selectData?.length === treeListData?.length) {
        setIsCheckAll(true);
      } else {
        setIsCheckAll(false);
      }
    }
    setTreeList(treeListData);
  }, [treeListData, selectData]);
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
      labelInValue={true}
      treeData={treeList}
      value={selectKeys}
      className={`${customclassName} normal-multi-select`}
      popupClassName={'normal-multi-dropdown'}
      maxTagCount={'responsive'}
      onChange={handleChange}
      allowClear={true}
      treeCheckable="true"
      treeDefaultExpandAll
      showCheckedStrategy="SHOW_PARENT"
      dropdownRender={(menu) => (
        <div>
          {treeList?.length > 0 ? (
            <>
              <div className={styles['normal-select-panel']}>
                <span
                  className={`${styles['check-button-class']} ${
                    isCheckAll ? `${styles['check-all-button-active']}` : null
                  }`}
                  onClick={handleCheckAll}
                >
                  全选
                </span>
                <span className={`${styles['check-button-class']}`} onClick={handleClearAll}>
                  清空
                </span>
              </div>
              <Divider style={{ margin: '4px 0' }} />
            </>
          ) : null}
          {menu}
        </div>
      )}
      placeholder={placeholdContent}
      style={{
        marginRight: 0,
      }}
    />
  );
}
export default NormalMultiSelect;
