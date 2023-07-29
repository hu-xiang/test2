import { Input, Modal, Form, Select, message, Tag, Tooltip, Button, Space, Popconfirm } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles.less';
import {
  addModelList,
  editMod,
  getCrtListInfo,
  getmodpk,
  delmodelDel,
  putUpdateThVal,
  getmodtype,
} from '../service';
import { PlusOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import UploadModel from './uploadModel';

const { TextArea } = Input;
const { Option } = Select;
type Iprops = {
  crtusershow: boolean;
  edtShow: boolean;
  onCancel: Function;
  onsetkey: Function;
  edtInfo: any;
};
export type Member = {
  modelId: string;
  modelName: string;
};

const CreateEditModel: React.FC<Iprops> = (props) => {
  const [kind, setKind] = useState<any>({
    0: '沥青路面目标检测（大模型）',
    // 1: '沥青路面图像分割',
    2: '沥青路面目标检测（小模型）',
    3: '附属设施识别算法模型',
    4: '农村公路单车道定检模型',
  });
  const saveInputRef = useRef<any>();
  const formref = useRef<any>();
  const [inputVisible, setInputVisible] = useState(false);
  const [modpkid, setModpkid] = useState<any>('');
  const [inputValue, setInputValue] = useState<any>('');
  const [tags, setTags] = useState<any>([
    '高速公路',
    '城市道路',
    '农村公路',
    '沥青路面',
    '水泥路面',
  ]);
  const [selTags, setSelTags] = useState<any>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(5);
  const actionRef = useRef<any>();
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);
  const [modelshow, setModelshow] = useState(false);
  const [tableData, setTableData] = useState<any>([]);
  const [edtFlagList, setEdtFlagList] = useState<any>();
  const [edtCodeList, setEdtCodeList] = useState<any>([]);

  useEffect(() => {
    if (props.edtShow) {
      setSelectedRowKey([props.edtInfo.useModelFileId]);
      if (props.edtInfo.useScene) {
        if (props.edtInfo.useScene.replace('[', '').replace(']', '').replace(/ /g, '')) {
          setTags([
            ...new Set([
              ...tags,
              ...props.edtInfo.useScene
                .replace('[', '')
                .replace(']', '')
                .replace(/ /g, '')
                .split(','),
            ]),
          ]);
          setSelTags([
            ...props.edtInfo.useScene
              .replace('[', '')
              .replace(']', '')
              .replace(/ /g, '')
              .split(','),
          ]);
        }
      }
      formref.current.setFieldsValue({
        ...props.edtInfo,
        // roadNum: undefined,
      });
    }
  }, []);

  const crtusers = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        if (selectedRowKey.length === 0 || !selectedRowKey[0]) {
          message.error({
            content: '提交失败，未上传模型',
            key: '提交失败，未上传模型',
          });
          return false;
        }
        const formList = formref.current.getFieldsValue();
        if (props.edtInfo) {
          formList.id = props.edtInfo.id;
        }
        // const formData = new FormData();
        // Object.keys(formList).forEach((key) => {
        //   if (typeof formList[key] === 'undefined' || formList[key] === null) {
        //     formData.append(key, '');
        //     formList[key] = '';
        //     return;
        //   }

        //   formData.append(key, `${formList[key]}`);
        // });

        // formData.append('useScene', selTags);
        if (!props.edtShow) {
          // formData.append('id', modpkid);
          formList.id = modpkid;
        }
        const useModelFileId = selectedRowKey[0];
        formList.useModelFileId = useModelFileId;
        if (selTags.length) {
          formList.useSceneArray = selTags;
        } else {
          formList.useSceneArray = [''];
        }
        if (!formList.remark) {
          formList.remark = null;
        }
        // formData.append('useModelFileId', selectedRowKey[0]);
        try {
          let res;
          if (props.edtShow) {
            res = await editMod(formList);
          } else {
            res = await addModelList(formList);
          }
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onCancel();
            props.onsetkey();
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
      .catch(() => {});
  };
  const showInput = () => {
    setInputVisible(true);
    setTimeout(() => {
      saveInputRef.current.focus();
    }, 10);
  };
  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };
  const handleInputConfirm = () => {
    const list = inputValue.split('');
    const reg = /^[\u4E00-\u9FA5]+$/;
    const newList: any = [];
    list.forEach((i: any) => {
      if (!reg.test(i) && inputValue !== '') return;
      newList.push(i);
    });
    const tagList = newList.join('');

    // setInputValue(tagList);
    if (tagList && tags.indexOf(tagList) === -1) {
      setTags([...tags, tagList]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  const handleClose = (removedTag: any) => {
    const tagslist = tags.filter((tag: any) => tag !== removedTag);
    setTags(tagslist);
    const selIndex: number = selTags.findIndex((val: any) => removedTag === val);
    selTags.splice(selIndex, 1);
    setSelTags([...selTags]);
  };
  const onload = (dataSource: any) => {
    dataSource.forEach((recode: any) => {
      if (recode.useModel) {
        setSelectedRowKey([recode.id]);
      }
    });
    if (!dataSource?.length) {
      if (searchPage > 1) {
        setSearchPage(searchPage - 1);
      } else {
        setSearchPage(1);
      }
    } else {
      setTableData(dataSource);
    }
  };
  const pagechange = async (page: any, pageSize: number) => {
    setSearchPage(page);
    setTabpage(page);
    // setSelectedRowKey([]);
    setTabpagesize(pageSize);
  };

  const removeFile = async (text: any) => {
    const formData = new FormData();
    formData.append('id', text.id);
    const hide = message.loading({
      content: '正在删除',
      key: '正在删除',
    });
    try {
      const res = await delmodelDel(formData);
      hide();
      if (res.status === 0) {
        message.success({
          content: '删除成功',
          key: '删除成功',
        });
        if (selectedRowKey[0] === text.id) {
          setSelectedRowKey([]);
        }
        actionRef.current.reload();
      }
      // else {
      //   message.error({
      //     content: res.message,
      //     key: res.message,
      //   });
      // }
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
  useEffect(() => {
    if (tableData.length) {
      setEdtFlagList(Array.from({ length: tableData.length }, () => true));
    }
  }, [tableData]);
  const manuCodeChange = async (e: any, recode: any, list: any, index: any) => {
    const edtList: any = edtCodeList;
    const obj = {
      id: recode.id,
      thresholdValue: e.target.value,
    };
    const res = await putUpdateThVal(obj);
    if (res.status === 0) {
      setTimeout(() => {
        actionRef.current.reload();
      }, 500);
    }
    const List = list;
    if (edtList?.length && edtList.findIndex((item: any) => item.id === recode.id) > -1) {
      edtList[edtCodeList.findIndex((item: any) => item.id === recode.id)].thresholdValue =
        e.target.value;
    } else {
      edtList.push(obj);
    }
    List[index] = true;
    setEdtFlagList([...list]);
    setEdtCodeList([...edtList]);
  };
  const columns: any = [
    {
      title: '编号',
      key: 'num',
      width: 60,
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
    },
    {
      title: '模型版本',
      dataIndex: 'modelVersion',
      key: 'modelVersion',
      width: 200,
      ellipsis: true,
    },
    {
      title: '阈值参数',
      dataIndex: 'thresholdValue',
      key: 'thresholdValue',
      width: 200,
      ellipsis: true,
      render: (text: any, recode: any, index: any) => {
        const list = Array.from({ length: tableData.length }, () => true);
        if (edtFlagList && edtFlagList[index]) {
          return (
            <div
              onDoubleClick={() => {
                list[index] = false;
                setEdtFlagList([...list]);
              }}
              // style={
              //   edtCodeList.findIndex((item: any) => item.id === recode.id) > -1
              //     ? { color: '#448E49' }
              //     : {}
              // }
            >
              {/* {edtCodeList.findIndex((item: any) => item.id === recode.id) > -1 &&
                (edtCodeList[edtCodeList.findIndex((item: any) => item.id === recode.id)].manCode
                  ? edtCodeList[edtCodeList.findIndex((item: any) => item.id === recode.id)].manCode
                  : '-')}
              {edtCodeList.findIndex((item: any) => item.id === recode.id) > -1 || text} */}
              {text}
            </div>
          );
        }
        if (edtFlagList && edtFlagList[index] === false) {
          return (
            <Input
              autoFocus
              onFocus={(e) => {
                e.currentTarget.select();
              }}
              style={{ height: 22 }}
              onBlur={(e: any) => manuCodeChange(e, recode, list, index)}
              defaultValue={
                (edtCodeList.findIndex((item: any) => item.id === recode.id) > -1 &&
                  (edtCodeList[edtCodeList.findIndex((item: any) => item.id === recode.id)]
                    .thresholdValue
                    ? edtCodeList[edtCodeList.findIndex((item: any) => item.id === recode.id)]
                        .thresholdValue
                    : '-')) ||
                recode.thresholdValue
              }
              onPressEnter={(e: any) => manuCodeChange(e, recode, list, index)}
            />
          );
        }
        return false;
      },
    },
    {
      title: '上传时间',
      dataIndex: 'crtTime',
      key: 'crtTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (text: any) => (
        <Space size="middle" className={styles.detailOperate}>
          <Popconfirm
            title="你确定要删除此模型吗？"
            onConfirm={() => removeFile(text)}
            // onCancel={cancel}
            overlayStyle={{ minWidth: 200 }}
            okText="确定"
            cancelText="取消"
            className="ahover"
          >
            <a className="ahover">删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  // const reqErr = () => {
  //   message.error({
  //     content: '查询失败!',
  //     key: '查询失败!',
  //   });
  // };
  const onSelectChange = (selectedRowKeys: any) => {
    setSelectedRowKey(selectedRowKeys);
  };
  const clickRow = (record: any) => {
    setSelectedRowKey([record.id]);
  };
  const getpk = async () => {
    const res = await getmodpk();
    setModpkid(res.data);
  };
  const gettype = async () => {
    const res = await getmodtype();
    const kindCopy2 = kind;
    if (res?.status === 0 && res?.data?.length > 0) {
      res.data.forEach((it: any) => {
        Object.keys(kind).map((i: any) => {
          if (it * 1 === i * 1) {
            delete kindCopy2[i];
          }
          return false;
        });
      });
    }
    setKind({ ...kindCopy2 });
  };
  useEffect(() => {
    // if (!props.edtShow) {
    getpk();
    gettype();
    setTimeout(() => {
      actionRef.current.reload();
    }, 10);
    // }
  }, []);

  return (
    <Modal
      title={props.edtShow ? '编辑模型' : '创建模型'}
      open={props.crtusershow}
      onCancel={() => props.onCancel()}
      onOk={() => crtusers()}
      className={`createEditModel ${styles.createEditModel}`}
      maskClosable={false}
      okText="提交"
    >
      <div className="box">
        <Form labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} ref={formref} colon={false}>
          <Form.Item
            labelCol={{ span: 4.5 }}
            wrapperCol={{ span: 19.5 }}
            label="模型名称"
            name="modelName"
            rules={[
              {
                required: true,
                pattern: /^[\u4E00-\u9FA5A-Za-z]+$/,
                message: '由中文、字母组成',
              },
            ]}
            className={'itemhalf'}
          >
            <Input autoComplete="off" placeholder="请输入模型名称" />
          </Form.Item>
          <Form.Item
            label="模型类型"
            name="modelType"
            rules={[{ required: true, message: '请选择模型类型' }]}
            className={'itemhalf'}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Select style={{ height: 40 }} placeholder="请选择模型类型" allowClear>
              {Object.keys(kind).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {kind[item]}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="应用场景" className={'model-scene'}>
            {inputVisible && (
              <Input
                ref={saveInputRef}
                type="text"
                size="small"
                className="tag-input"
                style={{ width: 78 }}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputConfirm}
                onPressEnter={handleInputConfirm}
              />
            )}
            {!inputVisible && (
              <Tag onClick={showInput} className="site-tag-plus">
                <PlusOutlined /> 添加场景
              </Tag>
            )}
            <div className={'tagBox'}>
              {tags.map((tag: any) => {
                const isLongTag = tag.length > 20;
                const tagElem = (
                  <Tag
                    className={`edit-tag ${
                      selTags.findIndex((val: any) => tag === val) !== -1 && 'seltag'
                    }`}
                    key={tag}
                    closable={
                      tag !== '高速公路' &&
                      tag !== '城市道路' &&
                      tag !== '农村公路' &&
                      tag !== '沥青路面' &&
                      tag !== '水泥路面'
                    }
                    onClose={() => handleClose(tag)}
                    onClick={() => {
                      const selIndex: number = selTags.findIndex((val: any) => tag === val);
                      if (selIndex !== -1) {
                        selTags.splice(selIndex, 1);
                        setSelTags([...selTags]);
                      } else {
                        setSelTags([...selTags, tag]);
                      }
                    }}
                  >
                    <span className="textTag">{isLongTag ? `${tag.slice(0, 20)}...` : tag}</span>
                  </Tag>
                );
                return isLongTag ? (
                  <Tooltip title={tag} key={tag}>
                    {tagElem}
                  </Tooltip>
                ) : (
                  tagElem
                );
              })}
            </div>
          </Form.Item>
          <Form.Item
            label="描述"
            name="remark"
            className={'model-desc'}
            rules={[
              {
                pattern: /^[\u4E00-\u9FA5A-Za-z,，：:'"”“’‘。.?？!！]+$/,
                message: '由中文、字母、标点字符组成',
              },
            ]}
          >
            <TextArea placeholder="请输入内容" style={{ height: 75 }} />
          </Form.Item>
          <div style={{ height: 32, lineHeight: '32px' }}>
            <span>模型配置</span>
            <span>
              <Button
                type="primary"
                className="uploadBtn"
                onClick={() => {
                  setModelshow(true);
                }}
              >
                上传模型
              </Button>
            </span>
          </div>
          <div className={'tablebox2'}>
            <ProTable<Member>
              columns={columns}
              request={getCrtListInfo}
              actionRef={actionRef}
              params={{
                // modelId: props.edtInfo.modelId,
                // modelName: props.edtInfo.modelName,
                // current: searchPage,
                modelId: props.edtShow ? props.edtInfo.id : modpkid,
              }}
              rowSelection={{
                selectedRowKeys: selectedRowKey,
                type: 'radio',
                onChange: onSelectChange,
              }}
              onRow={(record) => {
                return {
                  onClick: (e: any) => {
                    if (
                      e?.target &&
                      (e?.target?.nodeName === 'svg' ||
                        e?.target?.nodeName === 'path' ||
                        e?.target?.textContent === '取 消' ||
                        e?.target?.textContent === '确 定')
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
              pagination={{
                size: 'default',
                showQuickJumper: false,
                defaultPageSize: 5,
                hideOnSinglePage: true,
                // pageSize: 5,
                pageSizeOptions: ['5', '10', '20', '50'],
                onChange: pagechange,
                // showSizeChanger: false,
                current: searchPage,
              }}
              rowKey="id"
              tableAlertRender={false}
              toolBarRender={false}
              search={false}
              onLoad={onload}
              // onRequestError={reqErr}
            />
          </div>
        </Form>
      </div>
      {modelshow ? (
        <UploadModel
          modelshow={modelshow}
          onCancel={() => {
            setModelshow(false);
          }}
          onsetkey={() => {
            actionRef.current.reload();
          }}
          setSelectedRowKey={setSelectedRowKey}
          modpkid={props.edtShow ? props.edtInfo.id : modpkid}
        />
      ) : null}
    </Modal>
  );
};

export default CreateEditModel;
