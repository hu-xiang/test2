import { Modal, Form, Input, message } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from '../styles.less';
import { addSceneInfo, editSceneInfo, checkSceneName, getSceneTreeList } from '../service';
import { cloneDeep } from 'lodash';
import { checkTypeValues } from '../data.d';
import MultiTreeSelect from './multiTreeSelect';

type Iprops = {
  todo: string;
  modalShow: boolean;
  rowInfo: any;
  // multiTreeList: Record<number, any>;
  onCancel: () => void;
  refreshPage: () => void;
};
type treeItem = {
  id: string;
  checkName: string;
  // type: number;
};
type treeTypeItem = {
  title: string;
  value: string;
  key: string;
  // type?: number;
  level?: number;
};
type unionTpe = treeTypeItem & { children?: treeTypeItem[] | undefined };

const SceneTypeModal: React.FC<Iprops> = (props) => {
  const { todo, rowInfo, modalShow, onCancel, refreshPage } = props;
  // const childRef: any = useRef<React.ElementRef<typeof MultiTreeSelect>>();
  const [treeListData, setTreeListData] = useState<unionTpe[]>([]);
  const [selectTreeVal, setSelectTreeVal] = useState<number[]>([]);
  const [selectTreeData, setSelectTreeData] = useState<number[]>([]);
  const [parentNodes, setParentNodes] = useState<string[]>([]);
  const [checkType, setCheckType] = useState<any>('');
  const [sceneTypeName, setSceneTypeName] = useState<string>('');
  const [form] = Form.useForm();
  const checkSceneType = async (e: any) => {
    const param = {
      name: e,
    };
    const res = await checkSceneName(param);
    if (res.status === 0) {
      setCheckType('success');
      return Promise.resolve('success');
    }
    setCheckType('error');
    return Promise.resolve('fail');
  };

  // 表单的默认值以及重置值
  const defalutform = {
    sceneName: '', //
    checkItemIdList: [],
  };

  const rules: any = {
    sceneName: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          const regExp = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_（）-]|[>]){1,50}$/;
          if (!value) {
            callback('请输入场景类型!');
          } else if (sceneTypeName === value) {
            callback();
          } else if (!regExp.test(value)) {
            callback('数字、汉字、大小写字母、中文括号和下划线组成(50位以内)');
          } else {
            checkSceneType(value).then((val: any) => {
              if (val === 'success') {
                callback();
              } else {
                callback('场景类型重复');
              }
            });
          }
        },
      },
    ],
    checkItemIdList: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          if (!selectTreeVal || !selectTreeVal?.length) {
            callback('请输入排查项!');
          } else {
            callback();
          }
        },
      },
    ],
  };
  // 回填数据
  const setValue = () => {
    const objform: any = cloneDeep(defalutform);
    if (props.rowInfo) {
      Object.keys(defalutform).forEach((item: any) => {
        objform[item] = props.rowInfo[item] || '';
      });
    }
    return objform;
  };
  const getTreeList = async () => {
    const arr: unionTpe[] = [
      {
        title: '全部',
        value: '10000',
        key: '10000',
        level: 1,
        children: [],
      },
    ];
    const res = await getSceneTreeList();
    if (res.status === 0) {
      const pnodes: string[] = [];
      if (JSON.stringify(res?.data) !== '{}') {
        Object.keys(res?.data).forEach((it: any) => {
          pnodes.push((100 + Number(it)).toString());
          if (res?.data[it]?.length > 0) {
            const itemLable = checkTypeValues.find((itr) => itr.value === Number(it));
            const item: unionTpe = {
              title: itemLable?.label || '其他',
              value: (100 + Number(it)).toString(),
              key: (100 + Number(it)).toString(),
              level: 2,
              children: [],
            };
            res?.data[it].forEach((itn: treeItem) => {
              item?.children?.push({
                title: itn?.checkName,
                value: itn?.id,
                key: itn?.id,
                level: 3,
              });
            });
            arr[0]?.children?.push(item);
          }
        });
        setTreeListData(arr);
        setParentNodes(pnodes);
      }
    }
  };
  useEffect(() => {
    getTreeList();
    if (todo === 'edit') {
      // 回填数据
      const newdata = setValue();
      form.setFieldsValue({
        ...newdata,
      });
      setSceneTypeName(newdata?.sceneName);
      setSelectTreeData(newdata?.checkItemIdList);
      setSelectTreeVal(newdata?.checkItemIdList);
    }
  }, []);

  const submit = async () => {
    form
      .validateFields()
      .then(async () => {
        try {
          // const fkFacilitiesId: number = roadId;
          const formdata = form.getFieldsValue(true);
          let res: any;
          if (todo === 'edit') {
            res = await editSceneInfo({
              ...formdata,
              checkItemIdList: selectTreeVal,
              id: rowInfo?.id,
            });
          } else {
            res = await addSceneInfo({ ...formdata, checkItemIdList: selectTreeVal });
          }
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            refreshPage();
            onCancel();
          }
        } catch {
          message.error({
            content: '提交失败!',
            key: '提交失败!',
          });
        }
      })
      .catch(() => {});
  };
  const handletreeselect = (val: any) => {
    setSelectTreeVal(val);
  };

  return (
    <Modal
      title={props.todo === 'add' ? '场景创建' : '场景编辑'}
      open={modalShow}
      onCancel={() => onCancel()}
      okText="提交"
      onOk={() => {
        submit();
      }}
      width={622}
      maskClosable={false}
    >
      <Form
        labelCol={{ flex: '1 1 13%' }}
        wrapperCol={{ flex: '1 1 87%' }}
        colon={false}
        // style={{marginRight:10}}
        labelAlign="right"
        autoComplete="off"
        form={form}
        className={styles.form}
      >
        <Form.Item
          label="场景类型"
          name="sceneName"
          rules={rules.sceneName}
          validateStatus={checkType}
        >
          <Input disabled={props.todo === 'edit'} />
        </Form.Item>
        <Form.Item
          label="排查项"
          name="checkItemIdList"
          labelAlign="right"
          rules={rules.checkItemIdList}
        >
          <MultiTreeSelect
            // onRef={childRef}
            parentNodes={parentNodes}
            treeListData={treeListData}
            selectData={selectTreeData}
            todo={todo}
            disableFlag={rowInfo?.flag}
            customclassName={styles['multi-select']}
            handletreeselect={handletreeselect}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default SceneTypeModal;
