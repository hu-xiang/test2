import { Modal, Image } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { getDupListInfo, getDiseaseInfo } from '../service';
import ProTable from '@ant-design/pro-table';
import DistressCanvas from '../../../../components/DistressCanvas';
import { disease3 } from '../../../../utils/dataDic';

type Iprops = {
  duplicatesInfo: any;
  visibDuplicatesList: boolean;
  onCancel: Function;
  deviceId: any;
  tenant_id: any;
};
interface lsType {
  diseaseNameZh: string;
  area: string;
  length: string;
  collectTime: string;
  diseaseType: string;
}

const ls: lsType[] = [];

const DuplicatesList: React.FC<Iprops> = (props) => {
  const { duplicatesInfo, deviceId, tenant_id }: any = props;
  const [tabpagesize, setTabpagesize] = useState(20);
  const [searchPage, setSearchPage] = useState(1);
  const [edtFlagList, setEdtFlagList] = useState<any>(
    Array.from({ length: tabpagesize }, () => false),
  );
  const [data, setData] = useState<any>({ ls });
  const [info, setInfo] = useState<any>({});
  const [imgUrl, setImgUrl] = useState('');

  const actionRef = useRef<any>();
  const imgInfo = async (infos: any) => {
    if (!infos?.recode) return;
    const detRes = await getDiseaseInfo(infos.recode.id, tenant_id);
    setData(detRes.data);
  };
  const previewBigImg = (url: string) => {
    setImgUrl(url);
  };
  useEffect(() => {
    if (!data.ls.length && info?.recode?.id) {
      imgInfo(info);
    } else {
      setData({ ls: data.ls, url: data.url, num: 1 });
    }
  }, [edtFlagList, imgUrl]);
  const columns: any = [
    {
      title: '编号',
      key: 'num',
      width: 50,
      render: (text: any, record: any, index: any) =>
        `${(searchPage - 1) * tabpagesize + (index + 1)}`,
    },
    {
      title: '病害图片',
      key: 'imgUrl',
      dataIndex: 'imgUrl',
      width: 100,
      render: (text: any, recode: any, index: any) => {
        const list = Array.from({ length: tabpagesize }, () => false);
        // imgInfo(recode)
        return (
          <>
            <Image
              src={text}
              style={{ width: 58, height: 46 }}
              placeholder={true}
              preview={{
                visible: edtFlagList[index],
                src: imgUrl,
                onVisibleChange: (value) => {
                  list[index] = value;
                  setEdtFlagList([...list]);
                  setInfo({ recode });

                  if (!value) {
                    setData({ ls });
                    setImgUrl('');
                    setInfo({});
                  }
                },
              }}
            />
            {edtFlagList[index] ? (
              <>
                <DistressCanvas setImgUrl={previewBigImg} data={data} />{' '}
              </>
            ) : (
              ''
            )}
          </>
        );
      },
    },
    {
      title: '病害编号',
      dataIndex: 'diseaseNo',
      key: 'diseaseNo',
      width: 230,
      ellipsis: true,
    },
    {
      title: '病害类型',
      dataIndex: 'diseType',
      // key: 'diseaseNameZh',
      width: 140,
      render: (text: any, recode: any) => {
        const type = {
          1: '水泥路面',
          2: '沥青路面',
        };
        return recode?.taskType &&
          !Object.keys(disease3).some((i: any) => i * 1 === recode?.diseaseType)
          ? `${type[recode.taskType]}-${recode.diseaseNameZh}`
          : `${recode.diseaseNameZh}`;
      },
    },
    {
      title: '车辆经纬度',
      key: 'longitudeAndlatitude',
      width: 220,
      render: (text: any, recode: any) => {
        if (!recode.longitude) {
          return '-';
        }
        return `${recode.imgLongitude}, ${recode.imgLatitude}`;
      },
      ellipsis: true,
    },
    {
      title: ' 病害经纬度',
      key: 'diseaselongitudeAndlatitude',
      width: 220,
      render: (text: any, recode: any) => {
        if (!recode.imgLongitude) {
          return '-';
        }
        return `${recode.longitude}, ${recode.latitude}`;
      },
      ellipsis: true,
    },
    {
      title: ' 病害面积(m²)',
      dataIndex: 'area',
      key: 'area',
      width: 100,
      ellipsis: true,
    },
    {
      title: '采集时间',
      dataIndex: 'collectTime',
      key: 'collectTime',
      width: 150,
      ellipsis: true,
    },
  ];

  // const onSearch = async (e: any) => {
  //   setKeyword(e.target.value);
  // };
  const onLoad = (dataSource: any) => {
    if (!dataSource?.length) {
      setTabpagesize(dataSource?.length);
      if (searchPage > 1) {
        setSearchPage(searchPage - 1);
      } else {
        setSearchPage(1);
      }
    }
  };
  // const pageChange = (page: any) => {
  //   setSearchPage(page);
  //   // setTabpagesize(pageSize);
  // };
  const changetabval = (text: any) => {
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
      // setTabpage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
    // setSelectedRowKey([]);
  };

  // const reqErr = () => {
  //   message.error({
  //     content: '查询失败!',
  //     key: '查询失败!',
  //   });
  // };
  return (
    <Modal
      title={`重复列表`}
      open={props.visibDuplicatesList}
      onCancel={() => props.onCancel()}
      footer={false}
      className="duplicatesListbox2"
    >
      <div className={'tablebox2'}>
        <ProTable
          columns={columns}
          actionRef={actionRef}
          params={{
            // current: searchPage,
            ids: duplicatesInfo.filterIds,
            deviceId,
            tenant_id,
          }}
          request={duplicatesInfo.filterIds && getDupListInfo}
          rowKey="id"
          tableAlertRender={false}
          pagination={{
            showQuickJumper: false,
            defaultPageSize: 20,
            current: searchPage,
            // onChange: pageChange,
          }}
          scroll={{ y: 380 }}
          onLoad={onLoad}
          // polling={polling || undefined}
          toolBarRender={false}
          search={false}
          onChange={changetabval}
          // onRequestError={reqErr}
        />
      </div>
    </Modal>
  );
};

export default DuplicatesList;
