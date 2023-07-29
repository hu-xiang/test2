import React, { forwardRef, useImperativeHandle } from 'react';
import styles from './styles.less';
import { Form } from 'antd';
import ProForm, { ProFormSelect, ProFormText, ProFormDatePicker } from '@ant-design/pro-form';
import { workOrderTypeEnum } from '@/assets/data/dictionary';
import { getFacilititySelects } from 'baseline/src/services/commonApi';
import moment from 'moment';

export const defaultListItem = {
  id: '',
  orderId: '',
  orderNum: '',
  orderName: '',
  orderType: '',
  planTime: '',
  maintenanceUnit: '', // 养护单位
  facilitiesId: '', // 设施名称
};
const dateFormat = 'YYYY-MM-DD';
export type HeadFormType = Partial<typeof defaultListItem>;

interface IProps {
  listItem?: HeadFormType;
}

const HeadForm: React.ForwardRefRenderFunction<
  { getParams: () => Promise<HeadFormType | null> },
  IProps
> = ({ listItem }, ref) => {
  const [form] = Form.useForm();

  const getParams = async () => {
    try {
      const res = await form.validateFields();
      if (res) {
        return {
          ...res,
          orderId: listItem?.orderId,
        };
      }
    } catch (err) {
      return null;
    }
    return null;
  };

  useImperativeHandle(ref, () => {
    return {
      getParams,
    };
  });

  return (
    <div className={styles.wrap}>
      <ProForm<HeadFormType>
        layout="horizontal"
        form={form}
        colon={false}
        initialValues={listItem ? { ...listItem, orderType: `${listItem.orderType}` } : {}}
        grid
        submitter={false}
        rowProps={{
          gutter: [20, 0],
        }}
        size="large"
      >
        <ProFormText
          colProps={{ span: 24 }}
          name="orderName"
          label="工单名称"
          disabled={!!listItem}
          placeholder="请输入工单名称"
          rules={[{ required: true, message: '请输入工单名称' }]}
          fieldProps={{ maxLength: 50 }}
        />

        <ProFormSelect
          colProps={{ span: 12 }}
          rules={[{ required: true, message: '请选择工单类型' }]}
          valueEnum={workOrderTypeEnum}
          placeholder="请选择工单类型"
          name="orderType"
          label="工单类型"
        />

        <ProFormDatePicker
          placeholder="请选择计划完工时间"
          rules={[{ required: true, message: '请选择计划完工时间' }]}
          colProps={{ span: 12 }}
          name="planTime"
          label="计划完工时间"
          fieldProps={{
            disabledDate: (current) => {
              // Can not select days before today
              return current && current <= moment().subtract(1, 'day').endOf('day');
            },
            format: dateFormat,
            onChange(value, dateString) {
              form.setFieldsValue({ planTime: dateString });
            },
          }}
        />

        <ProFormText
          colProps={{ span: 12 }}
          name="maintenanceUnit"
          label="养护单位"
          placeholder="请输入养护单位名称"
          rules={[{ required: true, message: '请输入养护单位名称' }]}
        />

        <ProFormSelect
          colProps={{ span: 12 }}
          placeholder="请选择道路名称"
          disabled={!!listItem}
          rules={[{ required: true, message: '请选择道路名称' }]}
          request={getFacilititySelects}
          name="facilitiesId"
          label="道路名称"
        />
      </ProForm>
    </div>
  );
};

export default forwardRef(HeadForm);
