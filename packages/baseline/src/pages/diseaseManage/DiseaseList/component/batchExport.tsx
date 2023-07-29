import { Modal, Form, Radio, Spin, message } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from '../styles.less';
import validRule from '../../../../utils/validate';
// import { addSite, updateSite, getmachinelist, getproductlist } from '../service';
import { exportDisease } from '../service';
import { exportCom } from '../../../../utils/exportCom';

type searchType = {
  startTime: any;
  endTime: any;
  checkCode: any;
  disease: any;
  keyword: string;
  fkFacilitiesId: number;
  diseaseImp: any;
  severity: any;
};

type Iprops = {
  //  refreshPage: () => void;
  exportFlagshow: boolean;
  searchParams: Partial<searchType>;
  onCancel: () => void;
  idsArray: any;
  exportType: string;
};

const BatchExport: React.FC<Iprops> = (props) => {
  const [loading, setLoading] = useState<any>(false); //
  // const [autodecisiongraphlist, setAutodecisiongraphlist] = useState<any>([]); // 自动制图产品范围下拉框的值
  // const [selectedMachineKeys, setSelectedMachineKeys] = useState<any>([]);
  // const [selectedproductKeys, setSelectedproductKeys] = useState<any>([]);
  // 表单的默认值以及重置值
  const defalutform = {
    exportType: 'N',
    containImg: 'N',
  };

  const rules: any = {
    exportType: [{}],
    containImg: [validRule.inputRequired('导出照片必选一项')],
  };
  const [form] = Form.useForm();
  useEffect(() => {
    const getExcelData = async () => {
      const typeinfo = { excel: true, pdf: false };
      const newIds = props.idsArray?.length > 0 ? props.idsArray : [];
      const newInfo = { containImg: false, ...typeinfo, ids: newIds };

      const { severity, ...rest } = props?.searchParams;
      const newformdata = {
        ...newInfo,
        ...rest,
        severity: severity ? [severity] : undefined,
      };
      const hide = message.loading({
        content: '正在导出',
        key: '正在导出',
      });
      const res: any = await exportDisease(newformdata);
      hide();
      exportCom(res, undefined, 'application/octet-stream');
      message.success({
        content: '导出成功',
        key: '导出成功',
      });
    };
    if (props.exportType === 'excel') {
      setLoading(true);
      getExcelData();
      props.onCancel();
    }
  }, []);

  const handleExport = () => {
    // let hide: any;
    form
      .validateFields()
      .then(async () => {
        // hide = message.loading('正在导出');
        setLoading(true);
        try {
          const formData = form.getFieldsValue(true);
          let typeinfo = {};
          typeinfo = { excel: false, pdf: true };
          const containImg: boolean = formData.containImg === 'Y';
          const newInfo = { containImg, ...typeinfo, ids: props.idsArray };
          // const foData = new FormData();
          // Object.keys(props?.searchParams).forEach((it: any) => {
          //   if (props?.searchParams[it] !== undefined) {
          //     foData.append(it, props?.searchParams[it]);
          //   }
          // });
          const { severity, ...rest } = props?.searchParams;
          const newformdata = {
            ...newInfo,
            ...rest,
            severity: severity ? [severity] : undefined,
          };
          const hide = message.loading({
            content: '正在导出',
            key: '正在导出',
          });
          const res: any = await exportDisease(newformdata);
          hide();
          exportCom(res, undefined, 'application/octet-stream');
          message.success({
            content: '导出成功',
            key: '导出成功',
          });
          props.onCancel();
          return true;
        } catch {
          // hide();
          setLoading(false);
          message.error({
            content: '导出失败!',
            key: '导出失败!',
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

  //   const handleImgChange = (e: any) => {
  //       console.log('value',e?.target?.checked);
  //     form.setFieldsValue({containImg:e?.target?.checked});
  //   };

  return (
    <>
      <Modal
        title={'病害导出'}
        open={props.exportFlagshow && props?.exportType === 'pdf'}
        onCancel={() => props.onCancel()}
        onOk={() => handleExport()}
        destroyOnClose
        className={styles.diseaseExportClass}
        maskClosable={false}
        modalRender={(node) =>
          loading ? (
            <Spin className="loadingContent" spinning={loading} tip="正在导出中，请等待...">
              {node}
            </Spin>
          ) : (
            node
          )
        }
      >
        <div className={`exportClass ${styles.exportClass}`}>
          <Form
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
            form={form}
            colon={false}
            initialValues={defalutform}
          >
            <Form.Item label="导出内容" name="exportType" rules={rules.exportType}>
              <Radio.Group>
                {/* <Radio value="Y">Excel清单</Radio> */}
                <Radio value="N">PDF报告</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="导出照片" name="containImg" rules={rules.containImg}>
              <Radio.Group>
                <Radio value="N">否</Radio>
                <Radio value="Y">是</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default BatchExport;
