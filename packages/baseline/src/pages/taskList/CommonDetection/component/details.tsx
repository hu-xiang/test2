import { Modal, Space, Select, Input } from 'antd';
import React, { useState, useEffect, useMemo } from 'react';
import { useRequest } from 'umi';
import ProTable from '@ant-design/pro-table';
import styles from '../styles.less';
import Pie from './leftPie';
import { queryDetailInfo, queryDetailList } from '../service';
import { getDictData } from '../../../../utils/commonMethod';
import { taskState } from '../commonData';
import DistressDetail from './DistressDetail';

const { Option } = Select;

export type Member = {
  diseaseNameZh: string;
};
type Iprops = {
  ids: string;
  visibdetails: boolean;
  onCancel: Function;
  onBigImg: Function;
  type: string;
  rowInfo?: any;
};

const Details: React.FC<Iprops> = (props) => {
  const [code, setCode] = useState();
  const [types, setTypes] = useState('');
  const [fkImgId, setFkImgId] = useState('');
  const [checkResult, setCheckResult] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statuscolor, setStatuscolor] = useState('#d9d9d9');
  const [detName, setDetName] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(5);
  const [bhlist, setBhlist] = useState<any>([]);

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const changetabval = (text: any) => {
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
      setTabpage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
  };
  const onload = (dataSource: any) => {
    if (!dataSource?.length) {
      if (searchPage > 1) {
        setSearchPage(searchPage - 1);
      } else {
        setSearchPage(1);
      }
    }
  };
  const showdetails = (imgId: string, checkStatus: number, name: string) => {
    setIsModalVisible(true);
    setFkImgId(imgId);
    setCheckResult(checkStatus);
    setDetName(name);
  };

  const resultlist = [0, 1];
  const resulttype = {
    0: 'NG',
    1: 'OK',
  };

  const columns: any = [
    {
      title: '序号',
      key: 'num',
      width: 50,
      fixed: 'left',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
    },
    {
      title: '图片名称',
      dataIndex: 'fkImgName',
      key: 'fkImgName',
      ellipsis: true,
    },
    {
      title: '识别类别',
      dataIndex: 'diseaseNameZh',
      key: 'diseaseNameZh',
      ellipsis: true,
      width: 150,
    },
    {
      title: '检测结果',
      dataIndex: 'checkResult',
      key: 'checkResult',
      width: 80,
      render: (text: any) => {
        let result = 'OK';
        if (text === 99) {
          result = '检测失败';
        } else if (text === 0) {
          result = 'NG';
        }
        return result;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (text: any, record: any) => {
        return (
          <Space size="middle">
            <a
              className="ahover"
              onClick={() => showdetails(record?.fkImgId, record?.checkResult, record?.fkImgName)}
            >
              详情
            </a>
          </Space>
        );
      },
    },
  ];

  const { data } = useRequest(() => {
    return queryDetailInfo(props.ids);
  });

  const detail = data || {};

  useEffect(() => {
    const textcolor = {
      0: '#d9d9d9',
      1: '#1890ff',
      2: '#1890ff',
      3: '#52c41a',
      99: '#ff4d4f',
    };

    if (data) {
      setStatuscolor(textcolor[data.taskState]);
    }
  }, [data]);

  useEffect(() => {
    const queryBh = async () => {
      if (JSON.stringify(detail) !== '{}') {
        let dictCodes = ['asphalt', 'cement', 'safe_event'];
        if (detail?.modelType === 3) {
          dictCodes = ['subfacility'];
        }
        const dictData = await getDictData({ type: 2, dictCodes, scenesType: detail?.modelType });
        setBhlist(dictData);
      }
    };
    queryBh();
  }, [detail]);

  const handleInputChange = (value: any) => {
    setSearchPage(1);
    setCode(value);
  };

  const handleresultChange = (value: any) => {
    setSearchPage(1);
    setTypes(value);
  };

  return (
    <>
      <Modal
        title="任务详情"
        open={props.visibdetails}
        onCancel={() => props.onCancel()}
        footer={null}
        className="detailsbox"
      >
        <div className={styles.detailstop}>
          <div className={styles.jbtxt}>基本信息</div>
          <div className={styles.infotop}>
            <div className={styles.infobox}>
              <span>任务名称</span>{' '}
              <Input
                value={detail?.taskName}
                className={styles.picaddinp}
                disabled
                style={{ color: '#000' }}
              />
            </div>
            <div className={styles.infobox}>
              <span>任务状态</span>{' '}
              <Input
                value={taskState[detail.taskState]}
                className={styles.picaddinp}
                disabled
                style={{ color: statuscolor }}
              />
            </div>
            <div title={detail?.libraryNames} className={styles.infobox}>
              <span>模型名称</span>{' '}
              <Input
                value={detail?.modelName}
                className={styles.picaddinp}
                disabled
                style={{ color: '#000' }}
              />
            </div>
            <div className={styles.infobox}>
              <span>开始时间</span>{' '}
              <Input
                value={detail.taskStartTime}
                className={styles.picaddinp}
                disabled
                style={{ color: '#000' }}
              />
            </div>
            <div className={styles.infobox}>
              <span>完成时间</span>{' '}
              <Input
                value={detail.taskState === 3 ? detail.updTime : ''}
                className={styles.picaddinp}
                disabled
                style={{ color: '#000' }}
              />
            </div>
          </div>
        </div>
        <div className={styles.detailsbotm}>
          <div className={styles.testresult}>检测结果</div>
          <div className={styles.textbox}>
            <div className={styles.picpiebox}>
              {props?.type === 'pic' && (
                <div className={styles.picnumbox}>
                  <div className={styles.textleft}>
                    <div className={styles.imgnumtext}>总图片数量(张)</div>
                    <div className={styles.imgnum}>
                      {/* {String(detail!.imgErrorNums + detail!.imgOkNums + detail!.imgNgNums || 0)} */}
                      {String(props?.rowInfo?.imageNums || 0)}
                    </div>
                  </div>
                  <div className={styles.textright}>
                    <div className={styles.imgnumtext}>总检出数量(张)</div>
                    <div className={styles.imgnum}>{detail?.imgNgNums || 0}</div>
                  </div>
                </div>
              )}
              <div
                className={styles.piebox}
                style={props?.type !== 'pic' ? { width: '100%' } : { width: '542px' }}
              >
                <div className={styles.textbox2}>
                  <span>识别类型分布展示</span>
                </div>
                <div className={styles.boxbot}>
                  {useMemo(
                    () =>
                      detail?.ls && <Pie getkeyword={(_: any) => setCode(_)} data={detail?.ls} />,
                    [detail?.ls],
                  )}
                </div>
              </div>
            </div>
            <div className={styles.binglie}>
              <div className={styles.textbox2}>
                <span style={{ lineHeight: '30px' }}>识别列表</span>
                <span>
                  <Select
                    allowClear={true}
                    style={{ width: '200px', float: 'right', marginRight: '20px' }}
                    onChange={handleInputChange}
                    placeholder="请选择识别类别"
                    className="head-select"
                    value={code}
                  >
                    {bhlist?.length > 0 &&
                      bhlist.map((item: any) => (
                        <Option key={item?.id} value={item?.dictCode}>
                          {item?.dictName}
                        </Option>
                      ))}
                  </Select>
                </span>
                <span>
                  <Select
                    allowClear={true}
                    className="head-select"
                    style={{ width: '200px', float: 'right', marginRight: '20px' }}
                    onChange={handleresultChange}
                    placeholder="请选择检测结果"
                  >
                    {resultlist.map((item: number) => (
                      <Option key={item} value={item}>
                        {resulttype[item]}
                      </Option>
                    ))}
                  </Select>
                </span>
              </div>
              <div className={styles.tablebox2}>
                <ProTable<Member>
                  columns={columns}
                  request={queryDetailList}
                  params={{
                    id: props.ids,
                    code,
                    types,
                  }}
                  pagination={{
                    showQuickJumper: false,
                    defaultPageSize: 5,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    current: searchPage,
                  }}
                  scroll={{ y: 243 }}
                  rowKey="fkImgId"
                  toolBarRender={false}
                  search={false}
                  onChange={changetabval}
                  onLoad={onload}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {isModalVisible ? (
        <Modal
          title="识别详情"
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={null}
          width={1260}
          style={{ minWidth: 1205, top: 50 }}
          className="bingdetail btnzun"
        >
          <DistressDetail
            fkImgId={fkImgId}
            taskId={props.ids}
            modelType={detail?.modelType}
            checkResult={checkResult}
            detName={detName}
            imglist={{ tabpagesize, tabpage }}
            onBigImg={(obj: any, flag: any) => props.onBigImg(obj, flag)}
            code={code}
            types={types}
          />
        </Modal>
      ) : (
        ''
      )}
    </>
  );
};

export default Details;
