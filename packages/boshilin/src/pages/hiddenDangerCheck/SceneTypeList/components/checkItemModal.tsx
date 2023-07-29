import { Modal, Form, Input, message, Select, Checkbox } from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles.less';
import { addCheckInfo, checkName, editCheckInfo, getSelectCitiation } from '../service';
import { cloneDeep } from 'lodash';
import { checkTypeValues, plainOptions } from '../data.d';
import validRule from 'baseline/src/utils/validate';

const { Option } = Select;
type Iprops = {
  todo: string;
  modalShow: boolean;
  rowInfo: any;
  onCancel: () => void;
  refreshPage: () => void;
};
const initalValues = {
  optionsDataList: ['1'],
};
const CheckItemModal: React.FC<Iprops> = (props) => {
  const defalutform = {
    checkName: '', //
    checkType: undefined,
    optionsDataList: [],
    fkStandardCitationId: undefined,
  };
  const { todo, rowInfo, modalShow, onCancel, refreshPage } = props;
  const [itemName, setItemName] = useState<string>('');
  const [checkStatus, setCheckStatus] = useState<any>('');
  // const [checkTypeSel, setCheckTypeSel] = useState<number | string>('');
  const [selectKeys, setSelectKeys] = useState<string[]>(['1']);
  const [standardQuoteValues, setStandardQuoteValues] = useState<any[]>([]);
  const [form] = Form.useForm();
  const checkReName = async (e: any) => {
    const param = {
      name: e,
    };
    const res = await checkName(param);
    if (res.status === 0) {
      setCheckStatus('success');
      return Promise.resolve('success');
    }
    setCheckStatus('error');
    return Promise.resolve('fail');
  };
  const getStandardQuoteValues = async (val: number | string) => {
    const res = await getSelectCitiation({ type: val });
    if (res.status === 0) {
      const newdata = res?.data.map((it: any) => {
        return {
          lable: it?.citationEntry,
          value: it?.id,
        };
      });
      setStandardQuoteValues(newdata);
    }
  };

  useEffect(() => {
    const nval: number | string = todo === 'edit' ? rowInfo?.checkType : '';
    // setCheckTypeSel(nval);
    getStandardQuoteValues(nval);
  }, []);
  const handleCheckType = (val: number) => {
    // setCheckTypeSel(val);
    form.setFieldsValue({ fkStandardCitationId: undefined });
    getStandardQuoteValues(val);
  };
  // useEffect(()=>{
  //   console.log('ddd',checkTypeSel)
  //   getStandardQuoteValues(checkTypeSel)
  // },[checkTypeSel])

  const formref = useRef<any>(null);

  const rules: any = {
    checkName: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          const regExp = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_（）-]|[>]){1,50}$/;
          if (!value) {
            callback('请输入排查项名称!');
          } else if (itemName === value) {
            callback();
          } else if (!regExp.test(value)) {
            callback('数字、汉字、大小写字母、中文括号和下划线组成(50位以内)');
          } else {
            checkReName(value).then((val: any) => {
              if (val === 'success') {
                callback();
              } else {
                callback('名称重复');
              }
            });
          }
        },
      },
    ],
    checkType: [validRule.selectReq('排查类型')],
    optionsDataList: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          // console.log('first',selectKeys)
          if (selectKeys?.length < 2) {
            callback('请至少勾选2项选项值 !');
          } else {
            callback();
          }
        },
      },
    ],
    fkStandardCitationId: [validRule.selectReq('标准引用')],
  };
  // 回填数据
  const setValue = () => {
    const objform: any = cloneDeep(defalutform);
    if (props.rowInfo) {
      const excludeList = ['optionsDataList', 'fkStandardCitationId'];
      Object.keys(defalutform).forEach((item: any) => {
        if (excludeList.includes(item)) {
          objform[item] =
            item === 'fkStandardCitationId'
              ? props.rowInfo?.citationId
              : props.rowInfo?.optionsList?.map((it: any) => it?.toString()) || [];
        } else {
          objform[item] = props.rowInfo[item] || '';
        }
      });
    }
    return objform;
  };
  useEffect(() => {
    if (todo === 'edit') {
      let newval: string[] = [];
      if (props.rowInfo?.optionsList?.length) {
        newval = props.rowInfo?.optionsList.map((it: any) => it?.toString());
      }
      // console.log('newval',newval);
      setSelectKeys(newval);
      // 回填数据
      const newdata = setValue();
      form.setFieldsValue({
        ...newdata,
      });
      setItemName(newdata?.checkName);
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
            res = await editCheckInfo({ ...formdata, id: rowInfo?.id });
          } else {
            res = await addCheckInfo(formdata);
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

  const handleTypeData = (checkedValues: CheckboxValueType[]) => {
    const newVal: any[] = checkedValues;
    if (!checkedValues?.includes('1')) {
      newVal.unshift('1');
    }
    //  console.log('dd',checkedValues,newVal);
    setSelectKeys(newVal);
  };

  return (
    <Modal
      title={props.todo === 'add' ? '排查项创建' : '排查项编辑'}
      open={modalShow}
      onCancel={() => onCancel()}
      okText="提交"
      onOk={() => {
        submit();
      }}
      width={586}
      maskClosable={false}
    >
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        autoComplete="off"
        colon={false}
        initialValues={initalValues}
        ref={formref}
        form={form}
        className={styles.form}
      >
        <Form.Item
          label="排查项名称"
          name="checkName"
          rules={rules.checkName}
          validateStatus={checkStatus}
        >
          <Input disabled={props.todo === 'edit'} />
        </Form.Item>
        <Form.Item label="排查类型" name="checkType" rules={rules.checkType}>
          <Select
            style={{ height: 40 }}
            placeholder="请选择排查类型"
            allowClear
            onChange={handleCheckType}
          >
            {checkTypeValues
              .filter((it: any) => it.label !== '全部')
              .map((item: any) => (
                <Option key={item?.value} value={item?.value * 1}>
                  {item?.label}
                </Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="选项数据"
          name="optionsDataList"
          className={styles['checkbox-class']}
          rules={rules.optionsDataList}
        >
          <Checkbox.Group
            options={plainOptions}
            // defaultValue={['1']}
            value={selectKeys}
            onChange={handleTypeData}
          />
        </Form.Item>
        <Form.Item label="标准引用" name="fkStandardCitationId" rules={rules.fkStandardCitationId}>
          <Select style={{ height: 40 }} placeholder="请选择标准引用" allowClear>
            {standardQuoteValues.map((item: any) => (
              <Option key={item?.value} value={item?.value}>
                {item?.lable}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default CheckItemModal;
