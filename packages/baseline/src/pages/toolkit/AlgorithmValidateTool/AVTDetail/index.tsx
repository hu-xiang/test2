import React, { useState, useRef, useEffect } from 'react';
import styles from './styles.less';
import { useHistory } from 'umi';
import { Input, Select, Button, Modal, InputNumber, Image } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { isExist, commonExport, commonDel, commonRequest } from '../../../../utils/commonMethod';
import CommonTable from '../../../../components/CommonTable';
import MutiSelect from '../../../../components/MutiSelect';
import ImgCanvasModal from './ImgCanvasModal';
import { ReactComponent as ListBack } from '../../../../assets/img/backDisease/back.svg';

const { confirm } = Modal;
const { Option } = Select;
const requestList = [
  { url: '/traffic/algorithmVerifyDisease/export', method: 'post', blob: true },
  { url: '/traffic/algorithmVerifyDisease', method: 'delete' },
  { url: '/traffic/algorithmVerifyDisease/statistics', method: 'get' },
];

const testResultsEnum = {
  1: '正确',
  2: '误检',
  3: '漏检',
};

export default (): React.ReactElement => {
  const history: any = useHistory();
  const childRef1: any = useRef<React.ElementRef<typeof MutiSelect>>();
  const childRef2: any = useRef<React.ElementRef<typeof MutiSelect>>();
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [imgName, setImgName] = useState();
  const [diseaseTypes, setDiseaseTypes] = useState<any>([]);
  const [labelDiseaseTypes, setLabelDiseaseTypes] = useState<any>([]);
  const [confidenceIntervalStart, setConfidenceIntervalStart] = useState<any>();
  const [confidenceIntervalEnd, setConfidenceIntervalEnd] = useState<any>();
  const [verifyState, setVerifyState] = useState<any>();
  const [isShow, setIsShow] = useState<boolean>(false);
  const [rowInfo, setRowInfo] = useState<any>(null);
  const [tpNum, setTpNum] = useState<number>();
  const [fpNum, setFpNum] = useState<number>();
  const [fnNum, setFnNum] = useState<number>();
  const [correctRate, setCorrectRate] = useState<any>();
  const [recallRate, setRecallRate] = useState<any>();
  const [next, setNext] = useState<boolean>(false);
  const [pre, setPre] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any>([]);

  const [searchKey, setSearchKey] = useState<any>({
    imgName,
    verifyState,
    diseaseTypes,
    labelDiseaseTypes,
    confidenceIntervalStart,
    confidenceIntervalEnd,
  });
  const scroll = { x: 1200, y: 'calc(100vh - 287px)' };
  const ChildRef = useRef<any>();

  const getStatistics = async (params: any) => {
    const res = await commonRequest({ ...requestList[2], params });
    if (res?.data) {
      setTpNum(res?.data?.tpNum);
      setFpNum(res?.data?.fpNum);
      setFnNum(res?.data?.fnNum);
      const correct =
        res?.data?.tpNum === 0
          ? 0
          : (res?.data?.tpNum / (res?.data?.tpNum + res?.data?.fpNum)) * 100;
      const recall =
        res?.data?.tpNum === 0
          ? 0
          : (res?.data?.tpNum / (res?.data?.tpNum + res?.data?.fnNum)) * 100;
      setCorrectRate(`${correct?.toFixed(2)}%`);
      setRecallRate(`${recall?.toFixed(2)}%`);
    } else {
      setTpNum(undefined);
      setFpNum(undefined);
      setFnNum(undefined);
      setCorrectRate(undefined);
      setRecallRate(undefined);
    }
  };

  useEffect(() => {
    getStatistics({
      ...searchKey,
      taskId: sessionStorage?.getItem('validate-tool-id'),
      page: ChildRef?.current?.currentPage,
      pageSize: ChildRef?.current?.pagesize,
    });
  }, []);

  const setkeywords = () => {
    let params = '';
    if (next) params = 'next';
    if (pre) params = 'pre';
    ChildRef.current.onSet(params);
  };

  // 点击查询
  const onSearch = () => {
    let page = ChildRef?.current?.currentPage;
    if (next) page += 1;
    if (pre) page -= 1;
    getStatistics({
      imgName,
      verifyState,
      diseaseTypes,
      labelDiseaseTypes,
      confidenceIntervalStart,
      confidenceIntervalEnd,
      taskId: sessionStorage?.getItem('validate-tool-id'),
      page,
      pageSize: ChildRef?.current?.pagesize,
    });
    setSearchKey({
      imgName,
      verifyState,
      diseaseTypes,
      labelDiseaseTypes,
      confidenceIntervalStart,
      confidenceIntervalEnd,
    });
    setkeywords();
    setNext(false);
    setPre(false);
  };

  useEffect(() => {
    const listener = (event: any) => {
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        event.preventDefault();
        onSearch();
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [
    imgName,
    verifyState,
    diseaseTypes,
    labelDiseaseTypes,
    confidenceIntervalStart,
    confidenceIntervalEnd,
  ]);

  // 清除
  const onSelNull = () => {
    setDiseaseTypes([]);
    setLabelDiseaseTypes([]);
    setConfidenceIntervalStart(undefined);
    setConfidenceIntervalEnd(undefined);
    setImgName(undefined);
    setVerifyState(undefined);
    if (childRef1?.current) {
      childRef1?.current.clearFunc(true);
    }
    if (childRef2?.current) {
      childRef2?.current.clearFunc(true);
    }
    getStatistics({
      taskId: sessionStorage?.getItem('validate-tool-id'),
      page: 1,
      pageSize: ChildRef?.current?.pagesize,
    });
    setSearchKey({
      imgName: undefined,
      verifyState: undefined,
      diseaseTypes: undefined,
      labelDiseaseTypes: undefined,
      confidenceIntervalStart: undefined,
      confidenceIntervalEnd: undefined,
    });
    ChildRef.current.onSet('1');
  };

  const downloadflie = async () => {
    const params = {
      verifyDiseaseIds: selectedRows,
      imgName,
      verifyState,
      diseaseTypes,
      labelDiseaseTypes,
      confidenceIntervalStart,
      confidenceIntervalEnd,
      page: ChildRef.current.current,
      pageSize: ChildRef.current.pageSize,
      taskId: sessionStorage?.getItem('validate-tool-id'),
    };
    commonExport({ ...requestList[0], params });
  };

  const del = async (row: any, isBatch: boolean) => {
    const formData = new FormData();
    formData.append('idList', isBatch ? selectedRows : row.verifyDiseaseId);
    const res: any = await commonDel('是否删除该病害记录？', {
      ...requestList[1],
      params: formData,
    });
    if (res) setkeywords();
  };

  const rowMethods = async (row: any, type: string) => {
    switch (type) {
      case 'del':
        del(row, false);
        break;
      default:
        break;
    }
  };

  const getSelectedRows = (rows: any) => {
    setSelectedRows(rows);
  };

  const getTableData = (rows: any) => {
    setTableData(rows);
  };

  const handletreeselect1 = (value: any) => {
    setDiseaseTypes(value);
  };
  const handletreeselect2 = (value: any) => {
    setLabelDiseaseTypes(value);
  };

  const handerImgClick = (e: any, row: any) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(ChildRef?.current?.tableData);
    setRowInfo(row);
    setIsShow(true);
    console.log(row);
  };

  const nextPage = () => {
    setNext(true);
  };

  const prePage = () => {
    setPre(true);
  };

  useEffect(() => {
    if (next) {
      onSearch();
    }
  }, [next]);

  useEffect(() => {
    if (pre) {
      onSearch();
    }
  }, [pre]);

  const columns: any = [
    { title: '序号', key: 'verifyDiseaseId', width: 60, type: 'sort' },
    {
      title: '病害图片',
      key: 'imgUrl',
      width: 100,
      render: (_text: any, recode: any) => {
        return (
          <>
            <Image
              src={recode?.imgUrl}
              style={{ width: 58, height: 46 }}
              placeholder={true}
              onClick={(e: any) => handerImgClick(e, recode)}
              preview={{
                visible: false,
                src: recode?.imgUrl,
                // onVisibleChange: (value) => {
                // },
              }}
            />
          </>
        );
      },
    },
    { title: '图片名称', key: 'imgName', width: 200 },
    {
      title: '检测结果',
      key: 'verifyState',
      width: 100,
      valueEnum: testResultsEnum,
      colorEnum: {
        1: '#54A325',
        2: '#FACC2A',
        3: '#FF0000',
      },
    },
    {
      title: '置信度',
      key: 'confidenceInterval',
      width: 100,
      render: (_text: any, recode: any) => {
        return (
          <span>
            {recode?.confidenceInterval !== null
              ? Number(recode?.confidenceInterval)?.toFixed(2)
              : '-'}
          </span>
        );
      },
    },
    { title: '病害类型', key: 'diseaseNameCN', width: 160 },
    { title: '标注结果', key: 'labelDiseaseTypes', width: 200 },
    // {
    //   title: '操作',
    //   key: 'option',
    //   width: 100,
    //   type: 'operate',
    //   operateList: [
    //     {
    //       access: ['toolkit/AlgorithmValidateTool/detail:btn_del'],
    //       more: false,
    //       name: '删除',
    //       type: 'del',
    //     },
    //   ],
    // },
  ];

  return (
    <div id={styles.AVTDetail}>
      <div
        className={styles.taskBack}
        onClick={() => {
          history.push('/toolkit/AlgorithmValidateTool');
        }}
      >
        <ListBack />
        <div className={styles.backText}>算法验证列表</div>
      </div>

      <div className="page-list-common" style={{ marginTop: '-10px' }}>
        <div className={` ${styles.topSelect} head-two-box`} style={{ marginTop: '20px' }}>
          <div className={styles.rowClass}>
            <span className={styles.inpBox}>
              <div className={styles.rowLabel}>综合搜索</div>
              <Input
                className={styles.comClass}
                autoComplete="off"
                maxLength={60}
                placeholder="请输入图片名称"
                value={imgName}
                onChange={(e: any) => setImgName(e.target.value)}
              />
            </span>
            <span className={styles.inpBox}>
              <span className={styles.rowLabel}>检测结果</span>
              <Select
                style={{ width: '100%' }}
                allowClear
                placeholder="请选择"
                onChange={(e) => setVerifyState(e)}
                value={verifyState}
              >
                {Object.keys(testResultsEnum).map((item: any) => (
                  <Option key={item} value={item * 1}>
                    {testResultsEnum[item]}
                  </Option>
                ))}
              </Select>
            </span>
            <span className={styles.inpBox}>
              <span className={styles.rowLabel}>病害类型</span>
              <MutiSelect
                urgency={2}
                onRef={childRef1}
                handletreeselect={handletreeselect1}
                placeholder="请选择"
              />
            </span>
          </div>
          <div className={`${styles.rowClass} `}>
            <span className={styles.inpBox}>
              <span className={styles.rowLabel}>标注结果</span>
              <MutiSelect
                urgency={2}
                onRef={childRef2}
                handletreeselect={handletreeselect2}
                placeholder="请选择"
                requiredUnknownDisease={true}
              />
            </span>
            <span className={` ${styles.inpBox}`}>
              <div className={styles.rowLabel}>置信度</div>
              {/* <Input className={styles.comClass} /> */}
              <InputNumber
                min={0}
                max={1}
                controls={false}
                precision={2}
                className={styles.comClass}
                value={confidenceIntervalStart}
                onChange={(e: any) => {
                  if (e && confidenceIntervalEnd && e > confidenceIntervalEnd) {
                    setConfidenceIntervalStart(confidenceIntervalEnd);
                    setConfidenceIntervalEnd(e);
                    return;
                  }
                  setConfidenceIntervalStart(e);
                }}
              />
              <span>~</span>
              {/* <Input className={styles.comClass} /> */}
              <InputNumber
                min={0}
                max={1}
                controls={false}
                precision={2}
                className={styles.comClass}
                value={confidenceIntervalEnd}
                onChange={(e: any) => {
                  if (e && confidenceIntervalStart && e < confidenceIntervalStart) {
                    setConfidenceIntervalStart(e);
                    setConfidenceIntervalEnd(confidenceIntervalStart);
                    return;
                  }
                  setConfidenceIntervalEnd(e);
                }}
              />
            </span>
            <div className={styles.selBtnBox}>
              <Button
                type="primary"
                onClick={() => {
                  onSearch();
                }}
              >
                查询
              </Button>
              <Button
                onClick={() => {
                  onSelNull();
                }}
              >
                清除
              </Button>
            </div>
          </div>
        </div>
        <div className={`${styles.rowContent} row-button`}>
          <div className={styles.leftBox}>
            {isExist(['toolkit/AlgorithmValidateTool/detail:btn_export']) && (
              <Button
                className={'buttonClass'}
                type="primary"
                onClick={() => {
                  if (selectedRows.length === 0) {
                    confirm({
                      title: '是否导出查询列表所有数据？',
                      icon: <ExclamationCircleOutlined />,
                      okText: '确定',
                      okType: 'danger',
                      cancelText: '取消',
                      async onOk() {
                        return downloadflie();
                      },
                      onCancel() {},
                    });
                  } else {
                    downloadflie();
                  }
                }}
              >
                批量导出
              </Button>
            )}
            {/* {isExist(['toolkit/AlgorithmValidateTool/detail:btn_batchDel']) && (
              <Button
                className={'buttonClass'}
                disabled={!selectedRows?.length}
                onClick={() => del({}, true)}
              >
                批量删除
              </Button>
            )} */}
          </div>
          <div className={styles.rightBox}>
            <div className={styles.rightItem}>
              <span>准确率：</span>
              <span>{correctRate}</span>
            </div>
            <div className={styles.rightItem}>
              <span>召回率：</span>
              <span>{recallRate}</span>
            </div>
            <div className={`${styles.rightItemOther} ${styles.rightItem3}`}>
              <span>正确：</span>
              <span>{tpNum}</span>
            </div>
            <div className={`${styles.rightItemOther} ${styles.rightItem4}`}>
              <span>误检：</span>
              <span>{fpNum}</span>
            </div>
            <div className={`${styles.rightItemOther} ${styles.rightItem5}`}>
              <span>漏检：</span>
              <span>{fnNum}</span>
            </div>
          </div>
        </div>
        <div className={'page-table-back-two-box'}>
          <CommonTable
            scroll={scroll}
            columns={columns}
            searchKey={{ taskId: sessionStorage?.getItem('validate-tool-id'), ...searchKey }}
            rowMethods={rowMethods}
            onRef={ChildRef}
            url="/traffic/algorithmVerifyDisease/"
            getSelectedRows={getSelectedRows}
            method={'get'}
            rowKey="verifyDiseaseId"
            getTableData={getTableData}
          />
        </div>
      </div>

      {isShow && (
        <ImgCanvasModal
          isShow={isShow}
          onCancel={() => setIsShow(false)}
          tableData={tableData}
          rowInfo={rowInfo}
          nextPage={() => nextPage()}
          prePage={() => prePage()}
          total={ChildRef?.current?.total}
          page={ChildRef?.current?.currentPage}
          pageSize={ChildRef?.current?.pagesize}
        ></ImgCanvasModal>
      )}
    </div>
  );
};
