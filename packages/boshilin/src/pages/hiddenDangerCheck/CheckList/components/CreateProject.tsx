import { Modal, Form, Input, message } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from '../styles.less';
import { editProject, addProject, checkProjName } from '../service';
import { cloneDeep } from 'lodash';
import NormalMultiSelect from '../../components/NormalMultiSelect';
import { getFacilitityList } from 'baseline/src/services/commonApi';

type Iprops = {
  todo: string;
  modalShow: boolean;
  rowInfo: any;
  // multiTreeList: Record<number, any>;
  onCancel: () => void;
  refreshPage: (id?: any) => void;
};
type treeTypeItem = {
  title: string;
  value: string;
  key: string;
  level?: number;
};
type unionTpe = treeTypeItem & { children?: treeTypeItem[] | undefined };

const CreateProj: React.FC<Iprops> = (props) => {
  const { todo, rowInfo, modalShow, onCancel, refreshPage } = props;
  // const childRef: any = useRef<React.ElementRef<typeof MultiTreeSelect>>();
  const [treeListData, setTreeListData] = useState<unionTpe[]>([]);
  const [selectTreeVal, setSelectTreeVal] = useState<number[]>([]);
  const [selectTreeData, setSelectTreeData] = useState<any[]>([]);
  const [checkType, setCheckType] = useState<any>('');
  const [projName, setProjName] = useState<string>('');
  const [form] = Form.useForm();

  const checkProjectName = async (e: any) => {
    const param = {
      name: e,
    };
    const res: any = await checkProjName(param);
    if (res?.status === 0) {
      setCheckType('success');
      return Promise.resolve('success');
    }
    setCheckType('error');
    return Promise.resolve('fail');
  };

  // 表单的默认值以及重置值
  const defalutform = {
    projectName: '', //
    roadList: [],
  };

  const rules: any = {
    projectName: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          const regExp = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_（）-]|[>]){1,50}$/;
          if (!value) {
            callback('请输入项目名称!');
          } else if (projName === value) {
            callback();
          } else if (!regExp.test(value)) {
            callback('数字、汉字、大小写字母、中文括号和下划线组成(50位以内)');
          } else {
            checkProjectName(value).then((val: any) => {
              if (val === 'success') {
                callback();
              } else {
                callback('项目名称重复');
              }
            });
          }
        },
      },
    ],
    roadList: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          if (!selectTreeVal || !selectTreeVal?.length) {
            callback('请选择道路!');
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
        objform[item] = (props.rowInfo && props.rowInfo[item]) || '';
      });
    }
    return objform;
  };
  const getFacilitiesList = async () => {
    let rec: any = [];
    try {
      if (todo === 'proAdd' || (todo === 'proEdit' && rowInfo?.id)) {
        const res = await getFacilitityList({ name: '' });
        if (res?.status === 0) {
          res?.data.forEach((it: any) => {
            rec.push({ label: it.facilitiesName, value: it.id, key: it?.id });
          });
        }
      }
      if (todo === 'proEdit' && rowInfo && rowInfo?.id) {
        // 回填数据
        const newdata = setValue();
        form.setFieldsValue({
          ...newdata,
        });
        setProjName(newdata?.projectName);
        let reData: any[] = [];
        if (newdata?.roadList?.length) {
          reData = newdata?.roadList.map((it: any) => {
            return { label: it?.fkFacName, value: it?.fkFacId };
          });
        }
        setSelectTreeData(reData);
        setSelectTreeVal(reData);
      }
      setTreeListData(rec);
    } catch (error) {
      rec = [];
    }
  };
  useEffect(() => {
    getFacilitiesList();
  }, [rowInfo]);

  const submit = async () => {
    form
      .validateFields()
      .then(async () => {
        try {
          // const fkFacilitiesId: number = roadId;
          const formdata = form.getFieldsValue(true);
          let res: any;
          let newTreeData: any[] = [];
          if (selectTreeVal?.length) {
            newTreeData = selectTreeVal.map((it: any) => {
              return { fkFacId: it?.value, fkFacName: it?.label };
            });
          }
          if (todo === 'proEdit') {
            res = await editProject({
              ...formdata,
              roadList: newTreeData,
              id: rowInfo?.id,
            });
          } else {
            res = await addProject({ ...formdata, roadList: newTreeData });
          }
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            refreshPage(todo === 'proEdit' ? rowInfo?.id : '');
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
    // form.validateFields();
    // form.setFieldsValue({ roadList: val });
  };

  return (
    <Modal
      title={props.todo === 'proAdd' ? '排查项目创建' : '排查项目编辑'}
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
          label="项目名称"
          name="projectName"
          rules={rules.projectName}
          validateStatus={checkType}
        >
          <Input />
        </Form.Item>
        <Form.Item label="道路名称" name="roadList" labelAlign="right" rules={rules.roadList}>
          <NormalMultiSelect
            placeholdContent={'请选择道路名称'}
            treeListData={treeListData}
            selectData={selectTreeData}
            todo={todo}
            handletreeselect={handletreeselect}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default CreateProj;
