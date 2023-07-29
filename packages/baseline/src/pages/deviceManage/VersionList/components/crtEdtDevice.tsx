import {
  Input,
  Modal,
  Form,
  Select,
  message,
  Upload,
  Button,
  Popconfirm,
  Tooltip,
  Progress,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles.less';
import { uploadFile, removeFile, addVersionSave, versionEdit, splitUpload } from '../service';
import { UploadOutlined } from '@ant-design/icons';
import LinkIcon from './link';
import DeleteIcon from './delete';
import { getFileMd5 } from '../../../../utils/crypto';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
type Iprops = {
  edtShow: boolean;
  isCreate: boolean;
  onCancel: Function;
  onsetkey: Function;
  edtInfo: any;
};

let chunkSize: any = null;
let uploadedNum: number = 0;
let failUploadedNum: number = 0;
let chunkFileList: any = [];
const seqMaxNum: any = 3; // 最大请求数

const { confirm } = Modal;
const EdtMod: React.FC<Iprops> = (props) => {
  const { edtInfo, isCreate } = props;

  const { TextArea } = Input;

  // const [fileUrl, setFileUrl] = useState<any>([]);
  const [deviceTypeKind] = useState({
    0: '轻量化车载设备V1.0',
  });
  const [devType, setDevType] = useState(0);

  const [verExeInfo, setVerExeInfo] = useState<any>(null); // 版本程序
  const [verSignInfo, setVerSignInfo] = useState<any>(null); // 版本签名
  const [verCfgInfo, setVerCfgInfo] = useState<any>(null); // 配置文件
  const [process, setProcess] = useState<any>(0); // 分片上传进度

  const [uploadingExe, setUploadingExe] = useState<any>(false); // 版本程序上传
  const [uploadingVer, setUploadingVer] = useState<any>(false); // 版本签名上传
  const [uploadingCfg, setUploadingCfg] = useState<any>(false); // 配置文件上传

  const formref = useRef<any>();
  // const exeRef = useRef<any>();

  const crtusers = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        const formList = formref.current.getFieldsValue();

        try {
          let res: any;
          const params: any = {
            configVersion:
              verExeInfo?.configVersion || verSignInfo?.configVersion || verCfgInfo?.configVersion,
            modelVersion:
              verExeInfo?.modelVersion || verSignInfo?.modelVersion || verCfgInfo?.modelVersion,
            sysVersion: verExeInfo?.sysVersion || verSignInfo?.sysVersion || verCfgInfo?.sysVersion,
            deviceType: devType,
            fileList: [
              {
                content: verExeInfo?.content,
                fileName: verExeInfo?.fileName,
                fileType: 1,
                fileUrl: verExeInfo?.filePath || verExeInfo?.fileUrl,
                md5: verExeInfo?.md5,
              },
              {
                content: verSignInfo?.content,
                fileName: verSignInfo?.fileName,
                fileType: 2,
                fileUrl: verSignInfo?.filePath || verSignInfo?.fileUrl,
                md5: verSignInfo?.md5,
              },
              {
                content: verCfgInfo?.content,
                fileName: verCfgInfo?.fileName,
                fileType: 3,
                fileUrl: verCfgInfo?.filePath || verCfgInfo?.fileUrl,
                md5: verCfgInfo?.md5,
              },
            ],
            repairBug: formList?.fixBug,
            des: formList?.sysProfile,
          };

          if (props.isCreate) {
            res = await addVersionSave(params);
          } else {
            params.configVersion = edtInfo?.configVersion;
            params.modelVersion = edtInfo?.modelVersion;
            params.sysVersion = edtInfo?.sysVersion;
            params.id = edtInfo?.id;
            res = await versionEdit(params);
          }

          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onsetkey();
            props.onCancel();
          }
          //  else {
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
      .catch(() => {});
  };

  const uploadingProcessStatus = (fileType: any, loading: boolean) => {
    switch (fileType) {
      case '1':
        setUploadingExe(loading);
        break;
      case '2':
        setUploadingVer(loading);
        break;
      case '3':
        setUploadingCfg(loading);
        break;
      default:
        break;
    }
  };

  const uploadProgress = (chunkNums: any, fileType: any) => {
    const processNum = (uploadedNum * 100) / chunkNums;
    /* eslint-disable */
    setProcess(parseInt(processNum.toString()));
    /* eslint-enable */
    if (uploadedNum === chunkNums) {
      message.success({
        content: '文件上传成功！',
      });
      uploadingProcessStatus(fileType, false);
    }
    if (failUploadedNum > 0 && failUploadedNum + uploadedNum === chunkNums) {
      message.error({
        content: '部分文件上传失败，请稍后重新上传！',
      });
      uploadingProcessStatus(fileType, false);
    }
  };

  const handleUploadDone = (res: any, type: any) => {
    if (!formref?.current) return;
    const formlist: any = formref?.current?.getFieldsValue();
    const valRes: any = {};
    if (type === '1') {
      setVerExeInfo(res?.data);
      valRes.versionExe = res?.data?.filePath;
    }
    if (type === '2') {
      setVerSignInfo(res?.data);
      valRes.versionSign = res?.data?.filePath;
    }
    if (type === '3') {
      setVerCfgInfo(res?.data);
      valRes.CfgFile = res?.data?.filePath;
    }
    formref?.current?.setFieldsValue({ ...formlist, ...valRes });
  };

  const handleUploadFail = (fileType: any) => {
    uploadingProcessStatus(fileType, false);
    chunkFileList = [];
    failUploadedNum = 0;
    uploadedNum = 0;
  };
  const handleUploadFile = async () => {
    /* eslint-disable */
    return new Promise(async (resolve, reject) => {
      const handle = async () => {
        if (chunkFileList.length) {
          const toUploadFileInfo = chunkFileList.shift();
          const form = new FormData();
          form.append('file', toUploadFileInfo.chunkFile);
          form.append('chunkNums', toUploadFileInfo.chunkNums); // 总片数
          form.append('chunkNum', toUploadFileInfo.chunkNum.toString()); // 当前是第几片
          form.append('md5', toUploadFileInfo.md5);
          form.append('fileType', toUploadFileInfo.fileType);
          form.append('fileName', toUploadFileInfo.fileName);
          if (toUploadFileInfo.chunkNum === toUploadFileInfo.chunkNums) {
            form.append('files', toUploadFileInfo.file);
          }
          try {
            const res = await splitUpload(form);
            if (res?.data?.status === 0) {
              uploadedNum += 1;
              uploadProgress(toUploadFileInfo.chunkNums, toUploadFileInfo.fileType);

              if (uploadedNum === toUploadFileInfo.chunkNums) {
                handleUploadDone(res?.data, toUploadFileInfo.fileType);
              }
              if (uploadedNum + failUploadedNum === toUploadFileInfo.chunkNums) {
                resolve(res);
              } else {
                handle();
              }
            } else {
              handleUploadFail(toUploadFileInfo.fileType);
              reject('upload error');
            }
          } catch (err) {
            handleUploadFail(toUploadFileInfo.fileType);
          }
        }
      };

      // 控制并发
      for (let i = 0; i < seqMaxNum; i++) {
        handle();
      }
    });
    /* eslint-enable */
  };

  const createChunkFile = (file: any, type: any, chunkNums: any, md5: any) => {
    const fileChunkList = [];

    for (let i = 0; i < chunkNums; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
      fileChunkList.push({
        chunkFile: file.slice(start, end),
        chunkNum: i,
        fileType: type,
        md5,
        chunkNums,
        fileName: file.name,
        file,
      });
    }
    return fileChunkList;
  };
  const checkAndUploadChunk = async (file: any, md5: any, type: any) => {
    // 目前5M 一个分片
    chunkSize = 5 * 1024 * 1024;
    const chunkNums = Math.ceil(file.size / chunkSize);
    chunkFileList = createChunkFile(file, type, chunkNums, md5);

    // updateReqList(file, md5, type, chunkNums);
    await handleUploadFile();
  };

  const resetProcess = () => {
    chunkSize = null;
    uploadedNum = 0;
    failUploadedNum = 0;
    setProcess(0);
  };

  // type: 1  版本程序  2 版本签名  3 版本配置
  /* eslint-disable */
  const handleBeforeUpload = async (file: any, fileList: any, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', type);

    // 文件不超过2G
    if (file.size > 1024 * 1024 * 1024 * 2) {
      message.warning({
        content: '上传的文件不能超过2G, 请重新上传!',
        key: '上传的文件不能超过2G, 请重新上传!',
      });
      return;
    }

    // 上传文件大于5M 启用分片上传
    if (file.size > 1024 * 1024 * 5) {
      resetProcess();

      // 分片上传改造
      const msg = message.warning({
        content: '正在获取md5',
      });
      const md5 = await getFileMd5(file);
      if (md5) {
        msg();

        uploadingProcessStatus(type, true);

        checkAndUploadChunk(file, md5, type);

        return false;
      }
    } else {
      const res = await uploadFile(formData);
      if (res.status === 0) {
        // todo
        const formlist: any = formref.current.getFieldsValue();
        const valRes: any = {};
        if (type === '1') {
          setVerExeInfo(res?.data);
          valRes.versionExe = res?.data?.filePath;
        }
        if (type === '2') {
          setVerSignInfo(res?.data);
          valRes.versionSign = res?.data?.filePath;
        }
        if (type === '3') {
          setVerCfgInfo(res?.data);
          valRes.CfgFile = res?.data?.filePath;
        }
        formref.current.setFieldsValue({ ...formlist, ...valRes });
        message.success({
          content: '上传成功!',
          key: '上传成功!',
        });
      }
      return false;
    }
  };
  /* eslint-enable */

  const handleRemoveFile = async (file: any, type: string) => {
    const { filePath, fileUrl } = file;
    const formData = new FormData();
    formData.append('path', filePath || fileUrl);
    const hide = message.loading({
      content: '正在删除',
      key: '正在删除',
    });
    const formlist: any = formref.current.getFieldsValue();
    try {
      const res = await removeFile(formData);
      hide();
      if (res.status === 0) {
        message.success({
          content: '删除成功',
          key: '删除成功',
        });
        const valRes: any = {};
        if (type === '1') {
          setVerExeInfo(null);
          valRes.versionExe = '';
        }
        if (type === '2') {
          setVerSignInfo(null);
          valRes.versionSign = '';
        }
        if (type === '3') {
          setVerCfgInfo(null);
          valRes.CfgFile = '';
        }
        formref.current.setFieldsValue({ ...formlist, ...valRes });
      }
      return true;
    } catch (error) {
      hide();
      message.error({
        content: '删除失败!',
        key: '删除失败!',
      });
      return false;
    }
  };

  const handleSelectDevType = (val: any) => {
    setDevType(val);
  };

  useEffect(() => {
    if (!isCreate) {
      setDevType(edtInfo?.deviceType);

      const initvals = {
        deviceType: edtInfo?.deviceType,
        versionExe: edtInfo?.deviceType,
        versionSign: edtInfo?.deviceType,
        CfgFile: edtInfo?.deviceType,
        sysProfile: edtInfo?.des,
        fixBug: edtInfo?.repairBug,
      };
      const versionFileList = edtInfo?.versionFileList;
      versionFileList.forEach((file: any) => {
        if (file.fileType === 1) {
          setVerExeInfo(file);
        }
        if (file.fileType === 2) {
          setVerSignInfo(file);
        }
        if (file.fileType === 3) {
          setVerCfgInfo(file);
        }
      });
      formref.current.setFieldsValue(initvals);
    }
  }, []);

  const closeModal = () => {
    if (chunkFileList?.length) {
      confirm({
        title: '当前文件正在上传，确认关闭弹窗并取消文件上传吗',
        icon: <ExclamationCircleOutlined />,
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        async onOk() {
          chunkFileList = [];
          props.onCancel();
        },
        onCancel() {},
      });
    } else {
      props.onCancel();
    }
  };

  return (
    <Modal
      title={props.isCreate ? '版本创建' : '版本编辑'}
      open={props.edtShow}
      onCancel={() => closeModal()}
      onOk={() => crtusers()}
      className={`crtedtDev ${styles.crtedtDev} ${styles.versionListModal}`}
      destroyOnClose
      width={600}
      okText={'提交'}
    >
      <div className="box">
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 21 }} ref={formref} colon={false}>
          <Form.Item
            label="设备类型"
            name="deviceType"
            rules={[{ required: true, message: '请选择设备类型' }]}
          >
            <Select
              style={{ height: 40 }}
              placeholder="请选择设备类型"
              allowClear
              onSelect={(val: any) => handleSelectDevType(val)}
            >
              {Object.keys(deviceTypeKind).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {deviceTypeKind[item]}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="版本程序"
            name="versionExe"
            valuePropName="file"
            rules={[{ required: true, message: '请上传版本程序' }]}
          >
            <>
              <Upload
                maxCount={1}
                showUploadList={false}
                beforeUpload={(file: any, fileList: any) => handleBeforeUpload(file, fileList, '1')}
              >
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>

              {uploadingExe && (
                <div className={styles.updelwaper}>
                  <Progress percent={process} status="active" />
                </div>
              )}
              {!uploadingExe && verExeInfo && (
                <div className={styles.updelwaper}>
                  <div className={styles.uplodelbox}>
                    <LinkIcon />
                    <Tooltip title={verExeInfo?.fileName}>
                      <span className={styles.filename}>{verExeInfo?.fileName}</span>
                    </Tooltip>

                    <Popconfirm
                      title="你确定要删除此文件吗？"
                      onConfirm={() => handleRemoveFile(verExeInfo, '1')}
                      overlayStyle={{ minWidth: 200 }}
                      okText="确定"
                      cancelText="取消"
                    >
                      <span className={styles.uplodel}>
                        <DeleteIcon />
                      </span>
                    </Popconfirm>
                  </div>
                </div>
              )}
            </>
          </Form.Item>
          <Form.Item
            label="版本签名"
            name="versionSign"
            valuePropName="file"
            rules={[{ required: true, message: '请上传版本签名' }]}
          >
            <>
              <Upload
                maxCount={1}
                showUploadList={false}
                beforeUpload={(file: any, fileList: any) => handleBeforeUpload(file, fileList, '2')}
              >
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
              {uploadingVer && (
                <div className={styles.updelwaper}>
                  <Progress percent={process} status="active" />
                </div>
              )}
              {!uploadingVer && verSignInfo && (
                <div className={styles.updelwaper}>
                  <div className={styles.uplodelbox}>
                    <LinkIcon />
                    <Tooltip title={verExeInfo?.fileName}>
                      <span className={styles.filename}>{verSignInfo?.fileName}</span>
                    </Tooltip>

                    <Popconfirm
                      title="你确定要删除此文件吗？"
                      onConfirm={() => handleRemoveFile(verSignInfo, '2')}
                      overlayStyle={{ minWidth: 200 }}
                      okText="确定"
                      cancelText="取消"
                    >
                      <span className={styles.uplodel}>
                        <DeleteIcon />
                      </span>
                    </Popconfirm>
                  </div>
                </div>
              )}
            </>
          </Form.Item>
          <Form.Item
            label="配置文件"
            name="CfgFile"
            valuePropName="file"
            rules={[{ required: true, message: '请上传配置文件' }]}
          >
            <>
              <Upload
                maxCount={1}
                beforeUpload={(file: any, fileList: any) => handleBeforeUpload(file, fileList, '3')}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
              {uploadingCfg && (
                <div className={styles.updelwaper}>
                  <Progress percent={process} status="active" />
                </div>
              )}

              {!uploadingCfg && verCfgInfo && (
                <div className={styles.updelwaper}>
                  <div className={styles.uplodelbox}>
                    <LinkIcon />
                    <Tooltip title={verExeInfo?.fileName}>
                      <span className={styles.filename}>{verCfgInfo?.fileName}</span>
                    </Tooltip>

                    <Popconfirm
                      title="你确定要删除此文件吗？"
                      onConfirm={() => handleRemoveFile(verCfgInfo, '3')}
                      overlayStyle={{ minWidth: 200 }}
                      okText="确定"
                      cancelText="取消"
                    >
                      <span className={styles.uplodel}>
                        <DeleteIcon />
                      </span>
                    </Popconfirm>
                  </div>
                </div>
              )}
            </>
          </Form.Item>
          <Form.Item
            label="系统描述"
            name="sysProfile"
            className={`${styles.customFormItem} customFormItem`}
            rules={[
              {
                required: true,
                max: 32,
                message: '由中文、英文字母、数字、下划线和中划线组成',
                pattern: /^[\u4E00-\u9FA5A-Za-z0-9_-]+$/,
              },
            ]}
          >
            <TextArea rows={4} autoComplete="off" placeholder="请输入系统描述内容" />
          </Form.Item>
          <Form.Item
            label="修复BUG"
            name="fixBug"
            rules={[
              {
                required: true,
                max: 32,
                message: '由中文、英文字母、数字、下划线和中划线组成',
                pattern: /^[\u4E00-\u9FA5A-Za-z0-9_-]+$/,
              },
            ]}
          >
            <Input autoComplete="off" placeholder="" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default EdtMod;
