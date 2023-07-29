import { Table, Modal, Input, message, Select, Form } from 'antd';
import styles from '../styles.less';
import { useState, useEffect, useRef } from 'react';
import { getTaskpk, libList, addtask, getimglist, getModelListInfo } from '../service';
import PreviewImg from './DistressDetailImgPreview';
import React from 'react';

type Iprops = {
  visib: boolean;
  noCancel: Function;
  createSuccess: Function;
  onBigImg: Function;
  type: string;
};
const { Option } = Select;
let curPagePreviewData: any = null; // 当前页图片库数据
let curPreviewIndex: any = -1;
let previewPage: any = 1;
let previewPageSize: any = 20;

const TaskCreate: React.FC<Iprops> = (props) => {
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);
  const [libraryId, setLibraryId] = useState('');
  const [pklist, setPklist] = useState([]);
  const [pagenum, setPagenum] = useState(0);
  const [taskName, setTaskName] = useState<any>(0);
  const [show, setShow] = useState(false);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [taskType, setTaskType] = useState<any>();

  const [diseaList] = useState<any>([]);
  const [newNum] = useState(0);
  const [nextflag, setNextflag] = useState(false);
  const [preflag, setPreflag] = useState(true);
  // const [flag, setFlag] = useState(true);
  const [fkImgId, setFkImgId] = useState<any>();
  // const [listPage, setListPage] = useState(1);
  const listPageSize = 5;
  const [visible, setVisible] = useState(false);
  // const [dataLength, setDataLength] = useState(5);
  const [canvasDataUrl, setCanvasDataUrl] = useState('');
  const [imgId, setImgId] = useState();
  const [edtFlagList, setEdtFlagList] = useState<any>(
    Array.from({ length: tabpagesize }, () => false),
  );
  const [modelList, setModelList] = useState([]);

  const [previewDataTotal, setPreviewDataTotal] = useState(0); // 预览页总条数
  const [isSubmitBtnDisable, setIsSubmitBtnDisable] = useState(true);

  const formref = useRef<any>();
  const getpklist = async () => {
    setLoading(true);
    const res = await libList();
    const list = res.data.rows;
    setLoading(false);
    setPklist(list);
    const pagecount = res?.data?.total || 0;
    setPagenum(pagecount);
  };

  const pagechange = async (page: any, pageSize: any) => {
    setLoading(true);
    const currentPage = pageSize !== tabpagesize ? 1 : page;
    setTabpage(currentPage);
    setTabpagesize(pageSize);
    const params = {
      page: currentPage,
      pageSize,
    };
    const res = await libList(params);
    const list = res.data.rows;
    setLoading(false);
    setPklist(list);
  };

  const showCreate = async () => {
    const res = await getTaskpk();
    const res2: any = await getModelListInfo();
    setModelList(res2.data);
    if (res.status === 0) {
      setShow(props.visib);
      setLibraryId(res.data);
      formref.current.setFieldsValue({
        libraryId: res.data,
        // roadNum: undefined,
      });
    } else {
      setShow(false);
      // message.error({
      //   content: res.message,
      //   key: res.message,
      // });
    }
  };

  useEffect(() => {
    showCreate();
    getpklist();
  }, []);

  useEffect(() => {
    setPreflag(false);
    setNextflag(false);
    if (curPreviewIndex === 0 && previewPage === 1) {
      setPreflag(true);
    }
    if (previewPage === Math.ceil(previewDataTotal / previewPageSize)) {
      if (curPreviewIndex === curPagePreviewData.length - 1) {
        setNextflag(true);
      }
    }
  }, [curPreviewIndex]);

  const handleUpdatePreviewImgInfo = (todo?: string) => {
    if (todo === 'toPrev') {
      previewPage -= 1;
      curPreviewIndex = curPagePreviewData.length - 1;
      setCanvasDataUrl(curPagePreviewData[curPagePreviewData.length - 1].imageUrl);
    }
    if (todo === 'toNext') {
      previewPage += 1;
      curPreviewIndex = 0;
      setCanvasDataUrl(curPagePreviewData[0].imageUrl);
    }
    if (!todo) {
      curPreviewIndex = 0;
      setCanvasDataUrl(curPagePreviewData[0].imageUrl);
    }
  };
  // 查询图片库列表
  const sendDetail = async (todo?: string) => {
    const params = { id: imgId, current: previewPage, pageSize: previewPageSize };
    if (todo === 'toPrev') {
      params.current = previewPage - 1;
    }
    if (todo === 'toNext') {
      params.current = previewPage + 1;
    }
    const res = await getimglist(params);
    if (res.success) {
      curPagePreviewData = res.data || [];
      setPreviewDataTotal(+res.total);
      handleUpdatePreviewImgInfo(todo);
    }
  };

  const preDisea = () => {
    if (curPreviewIndex === 0 && previewPage > 1) {
      sendDetail('toPrev');
    } else {
      setCanvasDataUrl(curPagePreviewData[curPreviewIndex - 1].imageUrl);
      curPreviewIndex -= 1;
    }
  };

  const nextDisea = () => {
    if (
      curPreviewIndex === curPagePreviewData.length - 1 &&
      previewPage < Math.ceil(previewDataTotal / previewPageSize)
    ) {
      sendDetail('toNext');
    } else {
      curPreviewIndex += 1;
      setCanvasDataUrl(curPagePreviewData[curPreviewIndex].imageUrl);
    }
  };
  const handleReset = () => {
    curPagePreviewData = [];
    previewPage = 1;
    previewPageSize = 20;
    setPreviewDataTotal(0);
    curPreviewIndex = -1;
  };

  useEffect(() => {
    if (imgId && visible) {
      sendDetail();
    }
    if (!visible) {
      handleReset();
    }
  }, [visible]);
  useEffect(() => {
    if (diseaList.length > 0 && diseaList.length <= 2 * listPageSize) {
      if (
        (diseaList[listPageSize - 1] && fkImgId === diseaList[listPageSize - 1].id) ||
        (diseaList.length > listPageSize && diseaList[0].id === diseaList[listPageSize].id)
      )
        return;
      setFkImgId(diseaList[newNum]?.id);
      setCanvasDataUrl(diseaList[newNum].imageUrl);
    }
  }, [diseaList]);
  const drawBigImg = () => {
    const obj = {
      preflag,
      preDisea,
      nextflag,
      nextDisea,
    };
    props.onBigImg(obj, visible);
  };
  useEffect(() => {
    if (imgId) {
      drawBigImg();
    }
    // if (newNum === listPageSize - 1 && diseaList.length === 3 * listPageSize) {
    //   const list1 = diseaList.slice(0, 2 * listPageSize);
    //   const list = [...list1];
    //   setDiseaList(list);
    // }
  }, [visible, fkImgId, preflag, nextflag, imgId]);

  const columnsDiff =
    props?.type === 'pic'
      ? [
          {
            title: '图片库名称',
            dataIndex: 'libraryName',
            ellipsis: true,
            key: 'libraryName',
            render: (text: any, record: any, index: any) => {
              const list = Array.from({ length: tabpagesize }, () => false);
              return (
                <a
                  className={`${styles.previewImg} ahover`}
                  style={{ marginLeft: 10, marginBottom: 10, overflow: 'hidden' }}
                  title={text}
                  onClick={() => {
                    if (record.imgNums) {
                      list[index] = true;
                      setEdtFlagList([...list]);
                      setVisible(true);
                      setImgId(record.id);
                    } else {
                      message.warning({
                        content: '暂无图片',
                        key: '暂无图片',
                      });
                    }
                  }}
                >
                  {text}
                  {imgId && edtFlagList[index] && (
                    <PreviewImg url={canvasDataUrl} setVisible={setVisible} visible={visible} />
                  )}
                </a>
              );
            },
          },
          {
            title: '图片数量（张）',
            dataIndex: 'imgNums',
            key: 'imgNums',
            width: 150,
          },
        ]
      : [
          {
            title: '视频库名称',
            dataIndex: 'libraryName',
            ellipsis: true,
            key: 'libraryName',
          },
          {
            title: '道路名称',
            dataIndex: 'libraryName',
            key: 'libraryName',
            width: 150,
            ellipsis: true,
          },
          {
            title: '视频数量',
            dataIndex: 'imgNums',
            key: 'imgNums',
            width: 100,
          },
        ];

  const columns2 = [
    {
      title: '编号',
      key: 'num',
      width: 90,
      render: (text: any, record: any, index: any) =>
        `${(tabpage - 1) * tabpagesize + (index + 1)}`,
    },
    ...columnsDiff,
    {
      title: '创建人',
      dataIndex: 'crtName',
      key: 'crtName',
      width: 100,
    },
    {
      title: '创建日期',
      dataIndex: 'crtTime',
      key: 'crtTime',
      width: 200,
    },
  ];

  const onSelectChange = (selectedid: any) => {
    const selectlist: any = [...selectedid];
    setSelectedRowKey(selectlist);
  };

  const rowkey = (record: any) => {
    return record.id;
  };

  useEffect(() => {
    if (
      selectedRowKey.length &&
      formref.current?.getFieldValue('taskName') &&
      formref.current?.getFieldValue('modelName')
    ) {
      setIsSubmitBtnDisable(false);
    } else {
      setIsSubmitBtnDisable(true);
    }
  }, [
    selectedRowKey,
    formref.current?.getFieldValue('modelName'),
    formref.current?.getFieldValue('taskName'),
  ]);
  const submit = async () => {
    formref.current.validateFields().then(async () => {
      const formData = new FormData();
      const id = libraryId;
      if (!taskName) {
        message.error({
          content: '请填写任务名',
          key: '请填写任务名',
        });
        return false;
      }
      if (!selectedRowKey.length) {
        message.error({
          content: '提交失败，未选择图库！',
          key: '提交失败，未选择图库！',
        });
        return false;
      }
      if (!taskType) {
        message.error({
          content: '请选择模型名称',
          key: '请选择模型名称',
        });
        return false;
      }
      // if (!taskType) {
      //   message.error({
      //     content: '请填写设施类型',
      //     key: '请填写设施类型',
      //   });
      //   return false;
      // }
      formData.append('id', id);
      formData.append('taskName', taskName?.trim());
      formData.append('modelId', taskType);
      formData.append('idsList', selectedRowKey);
      try {
        const res = await addtask(formData);
        if (res.status === 0) {
          message.success({
            content: '提交成功',
            key: '提交成功',
          });
          props.noCancel();
          props.createSuccess();
        } else {
          // message.error({
          //   content: res.message,
          //   key: res.message,
          // });
        }
        return true;
      } catch (error) {
        message.error({
          content: '提交失败!',
          key: '提交失败!',
        });
        return false;
      }
    });
  };

  const changeValue = (text: any) => {
    setTaskName(text.target.value);
  };
  const selectValue = (text: any) => {
    setTaskType(text);
  };
  const clickRow = (record: any) => {
    const arr = selectedRowKey.filter((i: any) => i !== record.id);
    if (selectedRowKey.includes(record.id)) setSelectedRowKey(arr);
    else setSelectedRowKey([...arr, record.id]);
  };
  return (
    <Modal
      title="任务创建"
      open={show}
      onCancel={() => props.noCancel()}
      className="modbox1"
      okText="提交"
      onOk={() => {
        submit();
      }}
      // okButtonProps={{ disabled: !(formref.current?.validateFields() && selectedRowKey.length) }}
      okButtonProps={{ disabled: isSubmitBtnDisable }}
    >
      {/* 头部下拉框 */}
      <div className={styles.createbox}>
        <Form ref={formref} colon={false}>
          <div className={styles.selbox}>
            {/* <span className={styles.selname}>ID</span> */}
            <Form.Item label="ID" name="libraryId" rules={[{ required: true }]}>
              <Input
                value={libraryId}
                // style={{ marginLeft: -20 }}
                // className={styles.picaddinp}
                disabled
              />
            </Form.Item>
          </div>
          <div className={styles.selbox} style={{ verticalAlign: 'top' }}>
            <Form.Item
              label="任务名称"
              name="taskName"
              rules={[
                { required: true, message: '请填写任务名称' },
                { required: true, max: 50, message: '长度应不大于50位' },
                {
                  pattern: /^[\u4E00-\u9FA5A-Za-z0-9_-]+$/,
                  message: '由中文、字母、数字、下划线和中划线组成',
                },
              ]}
            >
              <Input
                placeholder="请输入"
                // maxLength={20}
                onBlur={changeValue}
                autoComplete="off"
                className={styles.picaddinp}
              />
            </Form.Item>
            {/* <Input
            placeholder="请输入"
            maxLength={20}
            onBlur={changeValue}
            className={styles.picaddinp}
          /> */}
          </div>
          <div className={styles.selbox}>
            <Form.Item
              label="模型名称"
              name="modelName"
              rules={[{ required: true, message: '请选择模型名称' }]}
            >
              <Select
                allowClear
                placeholder="请选择"
                style={{ marginRight: 0 }}
                onChange={selectValue}
              >
                {modelList.map((item: any) => (
                  <Option key={item.modelName} value={item.id}>
                    {item.modelName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {/* <Form.Item
              label="设施类型"
              name="taskType"
              rules={[{ required: true, message: '请选择设施类型' }]}
            >
              <Select
                allowClear
                placeholder="请选择"
                style={{ marginRight: 0 }}
                onChange={selectValue}
              >
                <Option value={2}>沥青路面</Option>
                <Option value={1}>水泥路面</Option>
              </Select>
            </Form.Item> */}
          </div>
        </Form>
      </div>
      <div className={styles.bottombox}>
        {/* 表格 */}
        <div>
          <div className={`${styles.tablebox} ${styles.taskTablebox}`}>
            <Table
              rowSelection={{
                type: 'checkbox',
                onChange: onSelectChange,
                selectedRowKeys: selectedRowKey,
              }}
              loading={loading}
              rowKey={rowkey}
              onRow={(record: any) => {
                return {
                  onClick: (e: any) => {
                    if (
                      e?.target &&
                      (e?.target?.nodeName === 'svg' || e?.target?.nodeName === 'path')
                    ) {
                      return;
                    }
                    if (
                      e?.target &&
                      (e.target?.className.indexOf('ahover') > -1 ||
                        e.target?.className.indexOf('ant-dropdown-menu-title-content') > -1)
                    ) {
                      return;
                    }
                    clickRow(record);
                  }, // 点击行
                };
              }}
              columns={columns2}
              dataSource={pklist}
              pagination={{
                size: 'small',
                disabled: false,
                showQuickJumper: false,
                showSizeChanger: true,
                defaultPageSize: 10,
                pageSizeOptions: ['10', '20', '50', '100'],
                total: pagenum,
                onChange: pagechange,
                current: tabpage,
              }}
              scroll={{ y: 408 }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
export default TaskCreate;
