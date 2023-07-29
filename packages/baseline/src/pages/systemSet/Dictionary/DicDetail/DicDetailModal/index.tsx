import { Input, Modal, Form, message, InputNumber, Select } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { commonRequest } from '../../../../../utils/commonMethod';
import styles from './styles.less';

const { Option } = Select;

type Iprops = {
  isModalshow: boolean;
  isEdit: boolean;
  onCancel: Function;
  onOk: Function;
  editInfo: any;
  parentCode: any;
  tenantId: any;
};

const sceneEnum = {
  1: '病害管理',
  2: '算法小模型',
  3: '附属设施',
  4: '农村道路检测模型',
};

const requestList = [
  { url: '/admin/dict/saveDict', method: 'post' },
  { url: '/admin/dict/editDict', method: 'put' },
  { url: '/admin/dict/getKey', method: 'get' },
  { url: '/admin/tenant/queryTenant', method: 'get' },
];

const DicModal: React.FC<Iprops> = (props) => {
  const formref = useRef<any>();
  const [tenantEnum, setTenantEnum] = useState<any>([]);
  // const [minKey, setMinKey] = useState<number>(0);

  const getTenant = async () => {
    const res = await commonRequest({ ...requestList[3] });
    setTenantEnum([...res?.data, { id: '-1', tenantName: '公共' }]);
  };

  // const getKey = async (val: any) => {
  //   const res = await commonRequest({ url: `${requestList[2]?.url}/${val}`, method: 'get' });
  //   setMinKey(res?.data);
  // };

  useEffect(() => {
    getTenant();
    // if (!props.isEdit) {
    //   getKey(props.tenantId ? props.tenantId : -1);
    // }
    if (props.isEdit) {
      formref.current.setFieldsValue({
        dictName: props.editInfo.dictName,
        dictCode: props.editInfo.dictCode,
        dictKey: props.editInfo.dictKey,
        level: props.editInfo.level,
        remark: props.editInfo.remark,
        sort: props.editInfo.sort,
        // category: props.editInfo.category,
        parentCode: props.parentCode,
        tenantId: [props.tenantId],
        scenesTypes: props.editInfo.scenesTypes,
      });
    } else {
      formref.current.setFieldsValue({
        parentCode: props.parentCode,
        tenantId: [props.tenantId],
        sort: 1,
      });
    }
  }, []);

  const handleSubmit = async () => {
    const formList = formref.current.getFieldsValue();
    formref.current
      .validateFields()
      .then(async () => {
        try {
          let res;
          formList.tenantId = formList?.tenantId?.length ? formList?.tenantId : [-1];
          if (props.isEdit) {
            formList.id = props.editInfo.id;
            res = await commonRequest({ ...requestList[1], params: formList });
          } else {
            formList.parentCode = props.parentCode;
            res = await commonRequest({ ...requestList[0], params: formList });
          }
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onCancel();
            props.onOk();
          }
          return true;
        } catch {
          message.error({
            content: '提交失败!',
            key: '提交失败!',
          });
          return false;
        }
      })
      .catch(() => {});
  };

  const onChange = (checked: boolean) => {
    console.log(`switch to ${checked}`);
  };

  return (
    <>
      <Modal
        title={props.isEdit ? '编辑字典' : '创建字典'}
        open={props.isModalshow}
        maskClosable={false}
        bodyStyle={{ maxHeight: 'calc(84vh - 136px)', overflow: 'scroll' }}
        style={{ top: '8%' }}
        onCancel={() => {
          props.onCancel();
        }}
        onOk={() => handleSubmit()}
        className={`dicDetailModal ${styles.dicDetailModal}`}
      >
        <div>
          <Form labelCol={{ span: 4 }} wrapperCol={{ span: 21 }} ref={formref} colon={false}>
            <Form.Item
              label="基础类型"
              name="parentCode"
              rules={[{ required: true, message: '请输入基础类型' }]}
            >
              <Input autoComplete="off" placeholder="请输入基础类型" disabled />
            </Form.Item>

            <Form.Item
              label="字典类型"
              name="dictCode"
              rules={[{ required: true, message: '请输入字典类型' }]}
            >
              <Input autoComplete="off" placeholder="请输入字典类型" disabled={props?.isEdit} />
            </Form.Item>

            <Form.Item
              label="字典名称"
              name="dictName"
              rules={[{ required: true, message: '请输入字典名称' }]}
            >
              <Input autoComplete="off" placeholder="请输入字典名称" />
            </Form.Item>

            <Form.Item
              label="字典键值"
              name="dictKey"
              rules={[{ required: true, message: '请输入字典键值' }]}
            >
              <InputNumber
                // min={minKey}
                // placeholder={`请输入字典键值, 最小${minKey}`}
                min={0}
                placeholder={`请输入字典键值`}
                style={{ width: '100%' }}
                disabled={props?.isEdit}
              />
            </Form.Item>

            <Form.Item
              label="显示排序"
              name="sort"
              rules={[{ required: true, message: '请输入排序号' }]}
            >
              <InputNumber min={0} placeholder="请输入排序号" style={{ width: '100%' }} />
            </Form.Item>

            {/* <Form.Item label="所属类别" name="category">
              <Select allowClear placeholder="请选择">
                <Option key={1} value={1}>
                  水泥
                </Option>
                <Option key={2} value={2}>
                  沥青
                </Option>
              </Select>
            </Form.Item> */}

            <Form.Item
              label="所属租户"
              name="tenantId"
              // rules={[{ required: true, message: '请选择所属租户' }]}
            >
              <Select
                allowClear
                showArrow
                placeholder="请选择所属租户"
                disabled
                mode="multiple"
                maxTagCount={'responsive'}
              >
                {/* <Select placeholder="请选择所属租户" allowClear disabled> */}
                {tenantEnum?.map((item: any) => (
                  <Option key={item?.id} value={item?.id}>
                    {item?.tenantName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="紧急程度"
              name="level"
              rules={[{ required: true, message: '请选择紧急程度' }]}
            >
              <Select allowClear placeholder="请选择" onChange={onChange}>
                <Option key={0} value={0}>
                  非紧急
                </Option>
                <Option key={1} value={1}>
                  紧急
                </Option>
              </Select>
            </Form.Item>

            <Form.Item label="应用场景" name="scenesTypes">
              <Select
                allowClear
                showArrow
                placeholder="请选择应用场景"
                mode="multiple"
                maxTagCount={'responsive'}
              >
                {Object.keys(sceneEnum)?.map((item: any) => (
                  <Option key={item} value={item}>
                    {sceneEnum[item]}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="备注" name="remark" className="texteare-class">
              <Input.TextArea rows={4} placeholder="请输入" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default DicModal;
