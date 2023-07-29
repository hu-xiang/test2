import { Modal, message, Select, Form } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
// import { useParams } from 'umi';
import styles from '../styles.less';
import validRule from 'baseline/src/utils/validate';
import { getAddSceneList, addSceneSave } from '../service';

type Iprops = {
  isShow: boolean;
  isCreate?: boolean;
  onCancel: () => void;
  onOk: Function;
};

const EdtMod: React.FC<Iprops> = (props) => {
  const formref = useRef<any>();
  const [form] = Form.useForm();
  // const urlParams: any = useParams();
  const { Option } = Select;

  const [sceneList, setSceneList] = useState<any>([]);

  const handleGetAddSceneList = async () => {
    const params = {
      // facId: urlParams?.facId,
      // projectId: urlParams?.id,
      facId: sessionStorage.getItem('checkList_fkFacId'),
      projectId: sessionStorage.getItem('checkList_proId'),
    };
    const res = await getAddSceneList(params);
    if (res.status === 0) {
      setSceneList(res?.data);
    }
  };
  useEffect(() => {
    handleGetAddSceneList();
  }, []);

  const crtusers = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        const formList = formref.current.getFieldsValue();
        try {
          let res: any = null;

          const params = {
            // projectId: urlParams?.id,
            projectId: sessionStorage.getItem('checkList_proId'),
            senceId: formList?.sceneName,
          };
          res = await addSceneSave(params);

          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onOk();
            props.onCancel();
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
  const rules: any = {
    checkType: [validRule.selectReq('排查类型')],
  };
  return (
    <Modal
      title={`场景创建`}
      open={props.isShow}
      onCancel={() => props.onCancel()}
      onOk={() => crtusers()}
      className={`crtedtDev ${styles.crtedtDev}`}
      destroyOnClose
      okText={'提交'}
    >
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        autoComplete="off"
        ref={formref}
        form={form}
        className={styles.form}
      >
        <Form.Item
          label="场景名称"
          name="sceneName"
          rules={rules.checkType}
          className={`sceneNameItem ${styles.sceneNameItem}`}
        >
          <Select style={{ height: 40 }} placeholder="请选择场景名称" allowClear>
            {sceneList.length &&
              sceneList.map((item: any) => (
                <Option key={item?.sceneId} value={item?.sceneId}>
                  {item?.sceneName}
                </Option>
              ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EdtMod;
