import { Input, Modal, Form, Image } from 'antd';
// import { divide } from 'lodash';
import React, { useRef } from 'react';
import styles from '../styles.less';

type Iprops = {
  isShow: boolean;
  isCreate?: boolean;
  onCancel: () => void;
  onOk: () => void;
  sceneData?: any;
  cropImgUrl?: any;
  handleDataCrop: () => void;
};

const EdtMod: React.FC<Iprops> = (props) => {
  const formref = useRef<any>();

  const { sceneData, handleDataCrop, cropImgUrl } = props;

  const fallback = 'images/placeholder.svg';

  const crtusers = async () => {
    props.onOk();
  };

  const initialValues = {
    fkKeySceneName: sceneData?.fkKeySceneName || '',
    fkSceneTypeName: sceneData?.fkSceneTypeName || '',
  };

  return (
    <Modal
      title={`场景裁剪`}
      open={props.isShow}
      onCancel={() => props.onCancel()}
      onOk={() => crtusers()}
      className={`crtedtDev ${styles.crtedtDev}`}
      destroyOnClose
      okText={'提交'}
    >
      <div className="box">
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 21 }}
          ref={formref}
          initialValues={initialValues}
        >
          <Form.Item
            label="场景名称"
            name="fkKeySceneName"
            rules={[
              {
                required: true,
                validator: () => {
                  if (sceneData?.fkKeySceneName) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('由中文、英文字母、数字、下划线和中划线组成'));
                },
              },
            ]}
          >
            <Input
              // defaultValue={sceneData?.fkKeySceneName}
              autoComplete="off"
              placeholder="请输入场景名称"
              disabled={true}
            />
          </Form.Item>
          <Form.Item
            label="场景类型"
            name="fkSceneTypeName"
            rules={[
              {
                required: true,
                validator: () => {
                  if (sceneData?.fkSceneTypeName) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('由中文、英文字母、数字、下划线和中划线组成'));
                },
              },
            ]}
          >
            <Input
              // defaultValue={sceneData?.fkSceneTypeName}
              autoComplete="off"
              placeholder="请输入场景类型"
              disabled={true}
            />
          </Form.Item>
          <Form.Item
            label="数据裁剪"
            name="dataCropImg"
            className={styles.customFormItem}
            rules={[
              {
                required: true,
                validator: () => {
                  if (sceneData?.sceneImgUrl) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('请裁剪图片'));
                },
              },
            ]}
          >
            <div className={styles.dataCropImgWrapper}>
              {!sceneData?.sceneImgUrl && !cropImgUrl && (
                <div className={styles.cropImgTip} onClick={() => handleDataCrop()}>
                  <span>+裁剪图片</span>
                </div>
              )}
              {(cropImgUrl || sceneData?.sceneImgUrl) && (
                <Image
                  preview={false}
                  height={104}
                  width={104}
                  placeholder={true}
                  fallback={fallback}
                  src={cropImgUrl || sceneData?.sceneImgUrl}
                  onClick={() => handleDataCrop()}
                />
              )}
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default EdtMod;
