import { Modal, Form, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { cloneDeep } from 'lodash';
import styles from '../styles.less';
import moment from 'moment';
import ProForm, { ProFormSelect, ProFormDigit } from '@ant-design/pro-form';
import validRule from '../../../../utils/validate';
import { getDeviceList } from '../service';
import { getFacilitityList } from '../../../../services/commonApi';
import { DatePicker } from 'antd';
import { addPlan, editPlan } from '../service';

type Iprops = {
  refreshPage: () => void;
  modalShow: boolean;
  rowInfo: any;
  onCancel: () => void;
  todo: any; // 标记是修改还是复制还是新增
};

const { RangePicker } = DatePicker;
const ImportModal: React.FC<Iprops> = (props) => {
  const [formModel] = Form.useForm();
  const dateFormat = 'YYYY-MM-DD';
  const [facilitiesList, setFacilitiesList] = useState<any>([]);
  const [deviceDatas, setDeviceDatas] = useState<any>([]);
  const [timePick, setTimePick] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 获取设施列表
  useEffect(() => {
    const getFacilitiesList = async () => {
      let rec: any = [];
      try {
        const res = await getFacilitityList({ name: '' });
        if (res?.status === 0) {
          res?.data.forEach((it: any) => {
            rec.push({ label: it.facilitiesName, value: it.id });
          });
        }
        setFacilitiesList(rec);
      } catch (error) {
        rec = [];
      }
    };
    const getDeviceDatas = async () => {
      let rec: any = [];
      try {
        const res = await getDeviceList();
        if (res?.status === 0) {
          res?.data.forEach((it: any) => {
            rec.push({ label: it.name, value: it.id });
          });
        }
        setDeviceDatas(rec);
      } catch (error) {
        rec = [];
      }
    };
    getFacilitiesList();
    getDeviceDatas();
  }, []);

  const formdt = {
    facilitiesId: '道路名称',
    deviceId: '巡检设备',
    inspectionFrequency: '巡检频率',
    inspectionTime: '巡检日期',
  };
  const rules: any = {
    facilitiesId: [validRule.selectReq('必选一项')],
    deviceId: [validRule.selectReq('必选一项')],
    inspectionFrequency: [validRule.pattern('int', '请输入正整数')],
    // inspectionTime:[validRule.inputTimeRequired('请选择日期')]
    inspectionTime: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          if (!timePick?.length || !(timePick && timePick[0])) {
            callback('请选择日期!');
          } else {
            callback();
          }
        },
      },
    ],
  };
  // 表单的默认值以及重置值
  const defalutform = {
    facilitiesId: undefined, //
    deviceId: undefined,
    inspectionFrequency: '', // 状态
    inspectionTime: '',
  };

  // 回填数据
  const setValue = () => {
    const objform: any = cloneDeep(defalutform);
    if (props.rowInfo) {
      Object.keys(defalutform).forEach((item: any) => {
        if (item === 'inspectionTime') {
          let timeArr: any[] = [];
          if (props.rowInfo?.startTime || props.rowInfo?.endTime) {
            timeArr = [
              moment(props.rowInfo?.startTime, dateFormat),
              moment(props.rowInfo?.endTime, dateFormat),
            ];
          }
          objform[item] = timeArr;
          formModel.setFieldsValue({ inspectionTime: timeArr });
          setTimePick([props.rowInfo?.startTime, props.rowInfo?.endTime]);
        } else {
          const it = props.rowInfo[item];
          objform[item] = it || defalutform[item];
        }
      });
    }
    return objform;
  };

  useEffect(() => {
    if (props.todo !== 'add') {
      const newdata = setValue();
      formModel.setFieldsValue({ ...newdata });
    }
  }, []);

  const timeRangeSelect = (dates: any, dateStrings: any) => {
    setTimePick(dateStrings);
  };

  const submitInfo = () => {
    formModel
      .validateFields()
      .then(async () => {
        try {
          setIsLoading(true);
          const formdata = formModel.getFieldsValue(true);
          let res: any;
          if (props.todo === 'edit') {
            const newFormParam = {
              ...formdata,
              id: props.rowInfo?.id,
              startTime: timePick?.length > 0 ? timePick[0] : props.rowInfo?.startTime,
              endTime: timePick?.length > 0 ? timePick[1] : props.rowInfo?.endTime,
            };
            delete newFormParam?.inspectionTime;
            res = await editPlan(newFormParam);
          } else {
            const newformdata = {
              deviceId: formdata?.deviceId,
              facilitiesId: formdata?.facilitiesId,
              inspectionFrequency: formdata?.inspectionFrequency,
              startTime: timePick?.length > 0 ? timePick[0] : '',
              endTime: timePick?.length > 0 ? timePick[1] : '',
            };
            res = await addPlan(newformdata);
          }
          setIsLoading(false);
          if (res.status === 0) {
            // setIsLoading(false);
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onCancel();
            props.refreshPage();
          }

          //  else {
          //   message.error({
          //     content: res.message,
          //     key: res.message,
          //   });
          // }
        } catch {
          setIsLoading(false);
          message.error({
            content: '提交失败!',
            key: '提交失败!',
          });
        }
      })
      .catch(() => {
        // message.error({
        //   content: '校验失败!',
        //   key: '校验失败!',
        // });
      });
  };

  return (
    <Modal
      title={props.todo === 'edit' ? '巡检计划编辑' : '巡检计划创建'}
      open={props.modalShow}
      confirmLoading={isLoading}
      onCancel={() => props.onCancel()}
      onOk={() => submitInfo()}
      destroyOnClose
      width={576}
      maskClosable={false}
      className={`${styles['inspect-modal-class']} inspect-class`}
    >
      <div className={styles.modalContentBox}>
        <ProForm
          layout="horizontal"
          form={formModel}
          colon={false}
          initialValues={defalutform}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          className={styles.tenantPageClass}
          // 配置按钮的属性
          submitter={{
            // 配置按钮的属性
            resetButtonProps: {
              style: {
                // 隐藏重置按钮
                display: 'none',
              },
            },
            submitButtonProps: {
              style: {
                // 隐藏重置按钮
                display: 'none',
              },
            },
          }}
        >
          <div className={`${styles['common-content-class']}`}>
            <ProFormSelect
              name="facilitiesId"
              disabled={props.todo === 'edit'}
              rules={rules.facilitiesId}
              label={formdt.facilitiesId}
              fieldProps={{ options: facilitiesList }}
              placeholder="请选择"
            />
            <ProFormSelect
              name="deviceId"
              rules={rules.deviceId}
              label={formdt.deviceId}
              fieldProps={{ options: deviceDatas }}
              placeholder="请选择"
            />
            <div className={styles['row-class']}>
              <ProFormDigit
                name="inspectionFrequency"
                label={formdt.inspectionFrequency}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                placeholder="输入天数"
                rules={rules.inspectionFrequency}
                fieldProps={{ precision: 0, min: 1, max: 365 }}
              />
              <span className="unit-class">天/次</span>
            </div>
            <ProForm.Item
              name="inspectionTime"
              label={formdt.inspectionTime}
              rules={rules.inspectionTime}
            >
              <RangePicker format={dateFormat} onChange={timeRangeSelect} />
            </ProForm.Item>
          </div>
        </ProForm>
      </div>
    </Modal>
  );
};

export default ImportModal;
