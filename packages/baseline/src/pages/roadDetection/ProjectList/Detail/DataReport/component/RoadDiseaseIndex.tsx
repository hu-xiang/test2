import React, { useState, useEffect, useRef } from 'react';
import HeadSearch from './HeadBox';
import { commonExport } from '../../../../../../utils/commonMethod';
import styles from '../styles.less';
import CommonTable from '../../../../../../components/CommonTable';

const requestList = [
  { url: '/traffic/road/project/report', method: 'POST' },
  { url: '/traffic/road/project/export/pdf', method: 'post', blob: true },
  { url: '/traffic/road/project/export/pavement/disease', method: 'post', blob: true },
];

const RoadDiseaseModal: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const ChildRef: any = useRef();
  const [diseaseTypes, setDiseaseTypes] = useState<any>([]);
  const [pdfFlag, setPdfFlag] = useState<boolean>(true);
  const [laneId, setLaneId] = useState<any>();
  const [direction, setDirection] = useState<number>(0);
  const [searchKey, setSearchKey] = useState<any>({
    pavementId: undefined,
    direct: 0,
    diseaseTypeList: [],
    projectId: sessionStorage.getItem('road_detection_id'),
    ids: [],
  });

  const handleDisease = (vals: any[]) => {
    setDiseaseTypes(vals);
  };
  const handleDirectInfo = (val: any) => {
    setDirection(val || 0);
  };
  const handleLaneInfo = (val: any) => {
    setLaneId(val);
  };

  useEffect(() => {
    setSearchKey({
      pavementId: laneId,
      direct: direction,
      diseaseTypeList: diseaseTypes,
      ids: selectedRows,
      projectId: sessionStorage.getItem('road_detection_id'),
    });
  }, [laneId, direction, diseaseTypes]);
  useEffect(() => {
    if (ChildRef.current) {
      ChildRef.current.onSet();
    }
  }, [searchKey?.pavementId, searchKey?.direct, searchKey?.diseaseTypes]);
  const exportData = async (type?: string) => {
    const newType = type === 'pdf' ? 'application/octet-stream' : 'application/vnd.ms-excel';
    if (type === 'pdf' && !selectedRows?.length) {
      return;
    }
    const params: any = {
      direct: direction,
      pavementId: laneId,
      projectId: sessionStorage.getItem('road_detection_id'),
      diseaseTypeList: diseaseTypes,
      ids: selectedRows,
      page: ChildRef?.current?.currentPage,
      pageSize: ChildRef?.current?.pagesize,
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
      title: '病害图片',
      key: 'imgUrl',
      width: 100,
      type: 'previewImage',
    },
    { title: '图片名称', key: 'imgName', width: 180 },
    {
      title: '病害类型',
      key: 'diseaseZh',
      width: 120,
    },
    {
      title: '病害面积(m²)',
      key: 'area',
      width: 120,
      render: (_text: any, recode: any) => {
        if (!recode?.area || recode?.area === null) {
          return '-';
        }
        return <span>{Number(recode?.area)?.toFixed(4)}</span>;
      },
    },
    {
      title: '病害长度(m)',
      key: 'length',
      width: 100,
      render: (_text: any, recode: any) => {
        if (!recode?.length || recode?.length === null) {
          return '-';
        }
        return <span>{Number(recode?.length)?.toFixed(4)}</span>;
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
    },
    { title: '采集时间', key: 'collectTime', width: 160 },
  ];

  return (
    <div className={`${styles['tab-panel-box']}}`}>
      <div className={styles['top-head-box']}>
        <HeadSearch
          handleDirectInfo={handleDirectInfo}
          handleLaneInfo={handleLaneInfo}
          exportData={exportData}
          pdfFlag={pdfFlag}
          handleDisease={handleDisease}
        />
      </div>
      <div
        className={`${styles['table-box-tabs']} ${styles['table-box-road-tabs']} ant-modal-image-common`}
      >
        <CommonTable
          scroll={{ x: '100%', y: 'calc(80vh - 258px)' }}
          columns={columns}
          onRef={ChildRef}
          isScroll={true}
          requireValue={'pavementId'}
          isRefresh={true}
          searchKey={{ ...searchKey }}
          rowMethods={() => {}}
          url="/traffic/road/project/detail/road"
          getSelectedRows={getSelectedRows}
          method={'post'}
          pageName={'road-disease-page'}
          diseImgPreview={true}
          arrowShow={false}
        />
      </div>
    </div>
  );
};
export default RoadDiseaseModal;
