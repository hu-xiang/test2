import React, { useState, useEffect, useRef } from 'react';
// import { Image } from 'antd';
// import ProTable from '@ant-design/pro-table';
import HeadSearch from './HeadBox';
// import type { DatePickerProps } from 'antd';
// import { useHistory } from 'umi';
import { commonExport } from '../../../../../../utils/commonMethod';
// import ImgCanvas from '../../../../../../components/DistressCanvas';
// import { ReactComponent as ListBack } from '../../../../assets/img/backDisease/back.svg';
import styles from '../styles.less';
import CommonTable from '../../../../../../components/CommonTable';
// import { ReactComponent as LeftImg } from '../../../../../../assets/img/leftAndRight/leftImg.svg';
// import { ReactComponent as RightImg } from '../../../../../../assets/img/leftAndRight/rightImg.svg';
// import moment from 'moment';

const requestList = [
  { url: '/traffic/road/project/report', method: 'POST' },
  { url: '/traffic/road/project/export/alone/pdf', method: 'post', blob: true },
  { url: '/traffic/road/project/export/alone/disease', method: 'post', blob: true },
];

const FacDamageModal: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const tableRef: any = useRef();
  // const [selectedRows, setSelectedRows] = useState<any>([]);
  const [damageValue, setDamageValue] = useState<any>([]);
  const [pdfFlag, setPdfFlag] = useState<boolean>(true);
  // const facilityId: any = sessionStorage.getItem('facilityID');
  const [direction, setDirection] = useState<number>(0);
  const [searchKey, setSearchKey] = useState<any>({
    direct: direction,
    typeList: damageValue,
    projectId: sessionStorage.getItem('road_detection_id'),
    ids: selectedRows,
  });

  const handleDamageVal = (val: any[]) => {
    // console.log('handleDamageVal',val,direction)
    setDamageValue(val);
    setSearchKey({
      direct: direction,
      typeList: val,
      projectId: sessionStorage.getItem('road_detection_id'),
      ids: selectedRows,
    });
  };
  const handleDirectInfo = (val: any) => {
    // console.log('handleDirectInfo in damage',val,damageValue)
    setDirection(val || 0);
    setSearchKey({
      direct: val,
      typeList: damageValue,
      projectId: sessionStorage.getItem('road_detection_id'),
      ids: selectedRows,
    });
  };
  // useEffect(() => {
  //   console.log('fffmmmm',direction);

  // }, [damageValue]);
  useEffect(() => {
    tableRef.current.onSet();
  }, [searchKey]);
  const exportData = async (type?: string) => {
    const newType = type === 'pdf' ? 'application/octet-stream' : 'application/vnd.ms-excel';
    if (type === 'pdf' && !selectedRows?.length) {
      return;
    }
    const params: any = {
      direct: direction,
      projectId: sessionStorage.getItem('road_detection_id'),
      typeList: damageValue,
      ids: selectedRows,
      page: tableRef?.current?.currentPage,
      pageSize: tableRef?.current?.pagesize,
    };
    const paramUrl = type === 'pdf' ? requestList[1] : requestList[2];
    commonExport({ ...paramUrl, params }, newType);
  };

  const getSelectedRows = (rows: any) => {
    setSelectedRows(rows);
    if (rows?.length) {
      setPdfFlag(false);
    } else {
      setPdfFlag(true);
    }
  };

  const columns: any = [
    { title: '序号', key: 'id', width: 60, type: 'sort' },
    {
      title: '损坏图片',
      key: 'imgUrl',
      width: 100,
      type: 'previewImage',
    },
    { title: '图片名称', key: 'imgName', width: 180 },
    {
      title: '损坏类型',
      key: 'diseaseZh',
      width: 120,
    },
    {
      title: '损坏长度(m)',
      key: 'length',
      width: 120,
      render: (_text: any, recode: any) => {
        if (!recode?.length || recode?.length === null) {
          return '-';
        }
        return <span>{Math.round(recode?.length)}</span>;
      },
    },
    {
      title: '道路名称',
      key: 'facilitiesName',
      width: 160,
    },
    {
      title: '桩号',
      key: 'stakeNo',
      width: 100,
      // formatKeys: ['stackNo', 'direction'],
      // formatEnum: { direction: { 0: '上行', 1: '下行' } },
    },
    { title: '采集时间', key: 'collectTime', width: 160 },
  ];

  return (
    // <>
    <div className={`${styles['tab-panel-box']}}`}>
      <div className={styles['top-head-box']}>
        <HeadSearch
          handleDirectInfo={handleDirectInfo}
          exportData={exportData}
          pdfFlag={pdfFlag}
          handleDamageVal={handleDamageVal}
        />
      </div>
      <div
        className={`${styles['table-box-tabs']} ${styles['table-box-damage-tabs']} ant-modal-image-common`}
      >
        <CommonTable
          scroll={{ x: '100%', y: 'calc(80vh - 258px)' }}
          isScroll={true}
          columns={columns}
          onRef={tableRef}
          searchKey={{ ...searchKey }}
          rowMethods={() => {}}
          url="/traffic/road/project/detail/alone"
          getSelectedRows={getSelectedRows}
          method={'post'}
          pageName={'fac-damage-page'}
          isRefresh={true}
          diseImgPreview={true}
          arrowShow={false}
        />
      </div>
    </div>
  );
};
export default FacDamageModal;
