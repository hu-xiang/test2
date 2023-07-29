import { Modal, Form, Switch, message, Cascader } from 'antd';
import React, { useEffect, useState } from 'react';
import { cloneDeep } from 'lodash';
import styles from '../styles.less';
import moment from 'moment';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import validRule from '../../../../utils/validate';
import { DatePicker } from 'antd';
import {
  addTenantUser,
  editTenantUser,
  checkAdmin,
  checkRealName,
  checkTenantName,
  province,
} from '../service';

type Iprops = {
  refreshPage: () => void;
  modalShow: boolean;
  rowInfo: any;
  tenantNum: string;
  onCancel: () => void;
  todo: any; // 标记是修改还是复制还是新增
};

let areaInfo: any = {};
const ImportModal: React.FC<Iprops> = (props) => {
  const [form] = Form.useForm();
  const [currentServiceStatus, setCurrentServiceStatus] = useState<any>(false); // 停用
  const dateFormat = 'YYYY-MM-DD';

  const formatTime = (format: any = 'YYYY-MM-DD') => {
    const time = new Date();
    let newformat = format;
    let strMonth: string | number = time.getMonth() + 1;
    let strDay: string | number = time.getDate();
    if (strMonth < 10) {
      strMonth = `0${strMonth}`;
    }
    if (strDay < 10) {
      strDay = `0${strDay}`;
    }
    const config = {
      YYYY: time.getFullYear(),
      MM: strMonth,
      DD: strDay,
    };
    Object.keys(config).forEach((it: any) => {
      newformat = newformat.replace(it, config[it]);
    });
    return newformat;
  };
  const [timeSelect, setTimeSelect] = useState<any>(formatTime());
  const [timePick, setTimePick] = useState<any>(moment(new Date(), dateFormat));
  const [superNo, setSuperNo] = useState<string>();
  const [ipPath, setIpPath] = useState<string>();
  const [tenantName, setTenantName] = useState<string>();
  const [nocheck, setNocheck] = useState<any>('');
  const [ipCheck, setIpCheck] = useState<any>('');
  const [tenantNameCheck, setTenantNameCheck] = useState<any>('');
  const [areaOps, setAreaOps] = useState<any>([]);

  const checkSuperNo = async (e: any) => {
    const param = {
      administration: e,
    };
    const res = await checkAdmin(param);
    if (res.status === 0) {
      setNocheck('success');
      return Promise.resolve('success');
    }
    setNocheck('error');
    return Promise.resolve('fail');
  };
  const checkIpPath = async (e: any) => {
    const param = {
      RealName: e,
      id: props.todo === 'edit' ? props?.rowInfo?.id : undefined,
    };
    const res = await checkRealName(param);
    if (res.status === 0) {
      setIpCheck('success');
      return Promise.resolve('success');
    }
    setIpCheck('error');
    return Promise.resolve('fail');
  };
  const checkTeName = async (e: any) => {
    const param = {
      TenantName: e,
    };
    const res = await checkTenantName(param);
    if (res.status === 0) {
      setTenantNameCheck('success');
      return Promise.resolve('success');
    }
    setTenantNameCheck('error');
    return Promise.resolve('fail');
  };
  const rules: any = {
    tenantType: [validRule.selectReq('必选一项')],
    tenantName: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          const regExp = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_-]|[>]){1,50}$/;
          if (!value) {
            callback('请输入租户名称!');
          } else if (tenantName === value) {
            callback();
          } else if (!regExp.test(value)) {
            callback('汉字、数字、大小写字母和下划线(50位以内)');
          } else {
            checkTeName(value).then((val: any) => {
              if (val === 'success') {
                callback();
              } else {
                callback('租户名称重复');
              }
            });
          }
        },
      },
    ],
    tenantVersion: [validRule.inputRequired('请输入系统版本')],
    serverExpirationTime: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          if (!timePick) {
            callback('请选择日期!');
          } else {
            callback();
          }
        },
      },
    ],
    area: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          if (!areaInfo.provinceId) {
            callback('请选择使用区域!');
          } else {
            callback();
          }
        },
      },
    ],
    serviceStatus: [validRule.inputRequired('必选一项')],
    domainSubdirectory: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          const regExp = /^\w{0,50}$/;
          if (!value) {
            callback('请输入域名!');
          } else if (ipPath === value) {
            callback();
          } else if (!regExp.test(value)) {
            callback('数字、大小写字母和下划线(50位以内)');
          } else {
            checkIpPath(value).then((val: any) => {
              if (val === 'success') {
                callback();
              } else {
                callback('域名重复');
              }
            });
          }
        },
      },
    ],
    administration: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          const regExp = /^\w{0,50}$/;
          if (!value) {
            callback('请输入超管账号!');
          } else if (superNo === value) {
            callback();
          } else if (!regExp.test(value)) {
            callback('数字、大小写字母和下划线(50位以内)');
          } else {
            checkSuperNo(value).then((val: any) => {
              if (val === 'success') {
                callback();
              } else {
                callback('超管账号重复');
              }
            });
          }
        },
      },
    ],
    administrationTel: [validRule.patternPhone()],
    administrationName: [validRule.limitNumber20()],
    administrationDeptName: [validRule.limitNumber20()],
    norule: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          callback();
        },
      },
    ],
  };
  // 表单的默认值以及重置值
  const defalutform = {
    tenantNum: '', //
    tenantType: 0,
    tenantName: '', // 状态
    tenantVersion: '',
    serverExpirationTime: undefined, //
    serviceStatus: false,
    domainSubdirectory: '',
    administration: '',
    administrationTel: '',
    administrationName: '',
    administrationDeptName: '',
    area: '',
  };
  const tenentTypeValues = [
    {
      label: '普通',
      value: 0,
    },
    {
      label: '专业',
      value: 1,
    },
    {
      label: '进阶',
      value: 2,
    },
  ];
  const disabledDate = (current: any) => {
    return (
      (current && current < moment().subtract(1, 'days')) || current > moment().add(1, 'years')
    );
  };
  const switchChange = () => {
    const status = !currentServiceStatus;
    setCurrentServiceStatus(status);
  };

  // 回填数据
  const setValue = () => {
    const objform: any = cloneDeep(defalutform);
    if (props.rowInfo) {
      Object.keys(objform).forEach((item: any) => {
        if (item === 'area') {
          objform[item] = [props.rowInfo?.provinceId, props.rowInfo?.cityId];
          areaInfo.provinceId = props.rowInfo?.provinceId;
          areaInfo.cityId = props.rowInfo?.cityId;
        } else if (item === 'administrationDeptName') {
          objform[item] = props.rowInfo?.deptName;
        } else {
          const it = props.rowInfo[item];
          objform[item] = it || defalutform[item];
        }
      });
    }
    return objform;
  };

  const handleTime = (date: any, dateString: string) => {
    setTimeSelect(dateString);
    const newdate = date ? moment(date, dateFormat) : undefined;
    setTimePick(newdate);
  };

  const submitInfo = () => {
    form
      .validateFields()
      .then(async () => {
        try {
          const formList = form.getFieldsValue();
          const { area, ...formdata } = formList;
          const { provinceId, provinceName, cityId, cityName } = areaInfo;
          const params = {
            ...formdata,
            provinceId,
            provinceName,
            cityId,
            cityName,
          };
          let res: any;
          if (props.todo === 'edit') {
            const newFormParam = {
              ...params,
              id: props.rowInfo?.id,
              serverExpirationTime: timeSelect,
            };
            res = await editTenantUser(newFormParam);
          } else {
            const newformdata = { ...params, serverExpirationTime: timeSelect };
            res = await addTenantUser('/admin/tenant/add/tenant', newformdata);
          }
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onCancel();
            props.refreshPage();
          }
          // else {
          //   message.error({
          //     content: res.message,
          //     key: res.message,
          //   });
          // }
          return true;
        } catch {
          message.error({
            content: '提交失败!',
            key: '提交失败!',
          });
          return false;
        }
      })
      .catch(() => {
        // message.error({
        //   content: '校验失败!',
        //   key: '校验失败!',
        // });
        return false;
      });
  };
  const resetArea = () => {
    areaInfo = {
      provinceId: '',
      provinceName: '',
      cityId: '',
      cityName: '',
    };
  };
  const areaChange = (val: any) => {
    if (val) {
      areaInfo = {
        provinceId: val[0],
        cityId: val[1],
      };
      const curPro = areaOps.filter((item: any) => item.id === val[0]);
      areaInfo.provinceName = curPro[0]?.cityName;
      const curCity = curPro[0]?.childrenList.filter((item: any) => item.id === val[1]);
      areaInfo.cityName = curCity[0]?.cityName;
    } else {
      resetArea();
    }
  };
  const handleGetProvince = async () => {
    const res = await province({});
    if (res.status === 0) {
      setAreaOps(res.data || []);
    }
  };
  useEffect(() => {
    handleGetProvince();
    return () => {
      resetArea();
    };
  }, []);

  useEffect(() => {
    if (props.todo !== 'add') {
      const newdata = setValue();
      setSuperNo(props.rowInfo?.administration);
      setIpPath(props.rowInfo?.domainSubdirectory);
      setTenantName(props.rowInfo?.tenantName);
      setTimeSelect(props.rowInfo?.serverExpirationTime);
      setTimePick(moment(props.rowInfo?.serverExpirationTime, dateFormat));
      setCurrentServiceStatus(props.rowInfo?.serviceStatus);
      form.setFieldsValue({ ...newdata });
    } else {
      form.setFieldsValue({ tenantNum: props?.tenantNum });
    }
  }, []);

  return (
    <Modal
      title={props.todo === 'edit' ? '编辑租户' : '创建租户'}
      open={props.modalShow}
      onCancel={() => props.onCancel()}
      onOk={() => submitInfo()}
      destroyOnClose
      width={932}
      maskClosable={false}
      className={`${styles.tenantModalClass} tenantMClass`}
    >
      <div className={styles.modalContentBox}>
        <ProForm
          layout="horizontal"
          form={form}
          colon={false}
          initialValues={defalutform}
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
          <div className={`${styles.infoTitle}`}>
            <span>基本信息</span>
          </div>
          <div className={`${styles.upContent} ${styles.commonContent}`}>
            <div className={styles.rowFormClass}>
              <ProFormText
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                fieldProps={{ disabled: true }}
                name="tenantNum"
                label="租户编号"
              />
              <ProFormSelect
                name="tenantType"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                rules={rules.tenantType}
                label="租户类型"
                fieldProps={{ options: tenentTypeValues }}
                placeholder="请选择"
              />
            </div>
            <div className={styles.rowFormClass}>
              <ProFormText
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                rules={rules.tenantName}
                validateStatus={tenantNameCheck}
                name="tenantName"
                label="租户名称"
              />
              <ProFormText
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                rules={rules.tenantVersion}
                name="tenantVersion"
                label="系统版本"
              />
            </div>
            <div className={styles.rowFormClass}>
              <ProForm.Item
                labelCol={{ span: 5 }}
                className="timeClass"
                wrapperCol={{ span: 19 }}
                name="serverExpirationTime"
                label="服务时间期限"
                rules={rules.serverExpirationTime}
              >
                <DatePicker
                  disabledDate={disabledDate}
                  defaultValue={moment(new Date(), dateFormat)}
                  format={dateFormat}
                  value={timePick}
                  picker={'date'}
                  onChange={handleTime}
                />
              </ProForm.Item>
              <ProForm.Item
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                name="area"
                label="使用区域"
                rules={rules.area}
              >
                <Cascader
                  displayRender={(label) => label.join('-')}
                  options={areaOps}
                  onChange={areaChange}
                  placeholder={'请选择'}
                  fieldNames={{
                    label: 'cityName',
                    value: 'id',
                    children: 'childrenList',
                  }}
                />
              </ProForm.Item>
            </div>
            <div className={styles.rowFormClass}>
              <ProForm.Item className="ipClass" name="test" label="域名子目录" rules={rules.norule}>
                <span className="ipSpanClass">http://visharp.trafficc.smartmore.com/</span>
                <div className="inputPClass2">
                  <ProFormText
                    style={{ width: '100%' }}
                    name="domainSubdirectory"
                    validateStatus={ipCheck}
                    rules={rules.domainSubdirectory}
                    label=""
                  />
                </div>
              </ProForm.Item>
              <ProForm.Item
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                name="serviceStatus"
                label="服务状态"
              >
                <Switch
                  checkedChildren="启动"
                  unCheckedChildren="停用"
                  checked={currentServiceStatus}
                  onChange={() => {
                    switchChange();
                  }}
                />
              </ProForm.Item>
            </div>
            {/* <div className={styles.rowFormFullClass}>
              <ProForm.Item className="ipClass" name="test" label="域名子目录" rules={rules.norule}>
                <span className="ipSpanClass">http://visharp.trafficc.smartmore.com/</span>
                <div className="inputPClass">
                  <ProFormText
                    name="domainSubdirectory"
                    validateStatus={ipCheck}
                    rules={rules.domainSubdirectory}
                    label=""
                  />
                </div>
              </ProForm.Item>
            </div> */}
            {/* <div className={styles.rowFormClass}>
              <ProForm.Item
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                name="area"
                label="使用区域"
              >
                <Cascader
                  displayRender={(label) => label.join('-')}
                  options={areaOps}
                  onChange={areaChange}
                  placeholder="Please select"
                />
              </ProForm.Item>
            </div> */}
          </div>
          <div className={`${styles.infoTitle}`}>
            <span>租户超管账号</span>
          </div>
          <div className={`${styles.downContent} ${styles.commonContent}`}>
            <div className={styles.rowFormClass}>
              <ProFormText
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                name="administration"
                fieldProps={{ disabled: props.todo === 'edit' }}
                validateStatus={nocheck}
                rules={rules.administration}
                label="超管账号"
              />
              <ProFormText
                labelCol={{ span: 6, style: { marginLeft: 10 } }}
                wrapperCol={{ span: 18 }}
                name="administrationTel"
                fieldProps={{ maxLength: 11 }}
                rules={rules.administrationTel}
                label="手机号"
              />
            </div>
            <div className={styles.rowFormClass}>
              <ProFormText
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                name="administrationName"
                rules={rules.administrationName}
                label="超管名称"
              />
              <ProFormText
                wrapperCol={{ span: 19 }}
                name="administrationDeptName"
                labelCol={{ style: { marginLeft: 15 } }}
                rules={rules.administrationDeptName}
                label="顶级部门名称"
              />
            </div>
          </div>
        </ProForm>
      </div>
    </Modal>
  );
};

export default ImportModal;
