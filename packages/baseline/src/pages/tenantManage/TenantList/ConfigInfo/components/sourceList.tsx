import { Form, TreeSelect, message, Divider } from 'antd';
import React, { useEffect, useState, useRef, useImperativeHandle } from 'react';
import type { FormDataType } from '../data';
import styles from '../styles.less';
import ProForm, { ProFormSelect, ProFormDigit } from '@ant-design/pro-form';
import { getSourceData, saveSourceData, getModelData } from '../../service';

type Iprops = {
  tenantId: any;
  onRef: any;
  tenantType: number;
};

const SourceList: React.FC<Iprops> = (props) => {
  const [form] = Form.useForm();
  const cKeys = useRef<any>();
  const cType = useRef<any>();
  const [tenantTypeData, setTenantTypeData] = useState<any>();
  const [tenantIdData, setTenantIdData] = useState<any>();
  const [formTypeData, setFormTypeData] = useState<FormDataType>();
  const [modelTypeList, setModelTypeList] = useState<any>([]); // 停用
  const [modelKeys, setModelKeys] = useState<any>([]);
  const [isCheckAll, setIsCheckAll] = useState<boolean>(false);
  const [cloneKeys, setCloneKeys] = useState<any>([]);
  // const [cKeys, setCKeys] = useState<any>([]);
  // const [cType, setCType] = useState<any>();
  // 表单的默认值以及重置值
  const defalutform = {
    configType: 0, //
    maxUploadNum: 0,
    maxAccessNum: 0,
    maxUserNum: 0,
    maxGpuSpeed: 0, //
    modelType: undefined,
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
    {
      label: '自定义',
      value: 3,
    },
  ];

  const handleCheckAll = () => {
    if (modelKeys?.length === modelTypeList?.length) {
      return;
    }
    setIsCheckAll(true);
    setModelKeys(cloneKeys);
  };
  const handleClearAll = () => {
    setIsCheckAll(false);
    setModelKeys([]);
  };
  const getSourceInitData = async (id: any) => {
    try {
      const res: any = await getSourceData({ tenantId: id });
      if (res?.status === 0) {
        setFormTypeData(res?.data);
        const modelSelectDatas = res?.data?.modelType ? res?.data?.modelType?.split(',') : [];
        form.setFieldsValue({ modelType: modelSelectDatas });
        setModelKeys(modelSelectDatas);
        cKeys.current = modelSelectDatas;
        const fieldKys = ['maxAccessNum', 'maxGpuSpeed', 'maxUploadNum', 'maxUserNum'];
        const newData: any = {};
        Object.keys(defalutform).forEach((itr: any) => {
          if (fieldKys.includes(itr) && res?.data) {
            newData[itr] = res?.data[itr];
          }
        });
        form.setFieldsValue({ ...newData });
      }
    } catch (error) {
      message.error({
        content: '接口调用失败',
        key: '接口调用失败',
      });
    }
  };
  const getInitModelData = async () => {
    try {
      const res: any = await getModelData();
      if (res?.status === 0) {
        const selectKeys: number[] = [];
        const newdata =
          res?.data?.length > 0
            ? res?.data?.map((it: any) => {
                selectKeys.push(it?.id);
                return { key: it?.id, label: it?.modelName, value: it?.id, children: [] };
              })
            : [];
        setCloneKeys(selectKeys);
        // setModelKeys(selectKeys);
        setModelTypeList(newdata);
        if (selectKeys?.length === res?.data?.length) {
          setIsCheckAll(true);
        } else {
          setIsCheckAll(false);
        }
      } else {
        setModelKeys([]);
      }
    } catch (error) {
      message.error({
        content: '模型接口调用失败',
        key: '模型接口调用失败',
      });
    }
  };
  const handleType = (e: any) => {
    if (e !== cType.current) {
      form.setFieldsValue({ modelType: [] });
      setModelKeys([]);
    } else {
      setModelKeys([...cKeys.current]);
    }
    setTenantTypeData(e);
    // getSourceInitData(props?.tenantId);
  };
  useEffect(() => {
    getInitModelData();
    setTenantTypeData(props?.tenantType);
    setTenantIdData(props?.tenantId);
    form.setFieldsValue({ configType: props?.tenantType * 1 || 0 });
    cType.current = props?.tenantType * 1 || 0;
    getSourceInitData(props?.tenantId);
  }, []);
  const resetSource = () => {
    // 还有配置类型切换为初始值
    setTenantTypeData(props?.tenantType);
    getSourceInitData(props?.tenantId);
    const newdata: any = {};
    let modelSelectDatas: any = [];
    Object.keys(defalutform).forEach((itr: any) => {
      if (formTypeData) {
        if (itr === 'modelType') {
          modelSelectDatas = formTypeData.modelType ? formTypeData?.modelType?.split(',') : [];
          setModelKeys(modelSelectDatas);
        }
        newdata[itr] = itr !== 'modelType' ? formTypeData[itr] : modelSelectDatas;
      }
    });
    form.setFieldsValue({ ...newdata, configType: props?.tenantType * 1 });
  };
  const saveSource = () => {
    form
      .validateFields()
      .then(async () => {
        try {
          const newformdata: any = {};
          const formdata = form.getFieldsValue(true);
          const modelTypeData = modelKeys.toString();
          //   const fieldkey=['crtHost','crtName','crtTime','crtUser'];
          Object.keys(defalutform).forEach((itr: any) => {
            newformdata[itr] = formdata[itr];
          });
          const newDatas = { ...newformdata, tenantId: tenantIdData, modelType: modelTypeData };
          const res = await saveSourceData(newDatas);
          if (res.status === 0) {
            cKeys.current = modelKeys;
            cType.current = formdata?.configType * 1;
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
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
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    saveSource,
    resetSource,
  }));

  const handleModelType = (text: any) => {
    setModelKeys(text);
    if (text?.length === modelTypeList?.length) {
      setIsCheckAll(true);
    } else {
      setIsCheckAll(false);
    }
  };

  return (
    <div className={styles.sourceContentBox}>
      <ProForm
        layout="horizontal"
        form={form}
        colon={false}
        initialValues={defalutform}
        className={styles.sourcePageClass}
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
        <ProFormSelect
          name="configType"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          label="配置类型"
          fieldProps={{
            options: tenentTypeValues,
            onChange: (e: any) => {
              handleType(e);
            },
          }}
          placeholder="请选择"
        />
        <ProFormDigit
          name="maxUploadNum"
          label="最大上传图片数量"
          // className="Class"
          placeholder="输入上传图片数量"
          min={0}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          // max={100}
          disabled={tenantTypeData !== 3}
          fieldProps={{
            precision: 0,
            addonAfter: '张',
            controls: false,
            maxLength: 20,
          }}
        />
        <ProFormDigit
          name="maxAccessNum"
          label="最大接入设备数量"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          placeholder="输入接入设备数量"
          min={0}
          disabled={tenantTypeData !== 3}
          fieldProps={{
            precision: 0,
            addonAfter: '套',
            controls: false,
            maxLength: 20,
          }}
        />
        <ProFormDigit
          name="maxUserNum"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          label="最大新建账号数量"
          placeholder="输入新建账号数量"
          min={0}
          disabled={tenantTypeData !== 3}
          fieldProps={{
            precision: 0,
            addonAfter: '个',
            controls: false,
            maxLength: 20,
          }}
        />
        <ProFormDigit
          name="maxGpuSpeed"
          label="GPU速率"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          placeholder="输入GPU速率"
          min={0}
          disabled={tenantTypeData !== 3}
          fieldProps={{
            precision: 0,
            addonAfter: '张/s',
            controls: false,
            maxLength: 20,
          }}
        />
        <ProForm.Item
          name="modelType"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          label="算法模型"
        >
          <TreeSelect
            treeData={modelTypeList}
            value={modelKeys}
            className="sourceModelClass"
            popupClassName="dropdownModelClass"
            maxTagCount={'responsive'}
            onChange={handleModelType}
            allowClear={true}
            treeCheckable="true"
            dropdownRender={(menu) => (
              <div>
                {modelTypeList?.length > 0 ? (
                  <>
                    <div className={'selectExpandClass'}>
                      <span
                        className={`selectButtonClass ${isCheckAll ? 'checkAllClass' : null}`}
                        onClick={handleCheckAll}
                      >
                        全选
                      </span>
                      <span className={'selectButtonClass'} onClick={handleClearAll}>
                        清空
                      </span>
                    </div>
                    <Divider style={{ margin: '4px 0' }} />
                  </>
                ) : null}
                {menu}
              </div>
            )}
            treeDefaultExpandAll
            showCheckedStrategy="SHOW_PARENT"
            placeholder="请选择算法模型"
          />
        </ProForm.Item>
      </ProForm>
    </div>
  );
};

export default SourceList;
