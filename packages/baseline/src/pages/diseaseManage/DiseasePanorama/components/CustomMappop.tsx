import React, { useState, useEffect, useImperativeHandle } from 'react';
import { Modal, Image, Pagination } from 'antd';
import DistressCanvas from '../../../../components/DistressCanvas';

import { getDiseaseInfo } from '../service';
import styles from '../styles.less';
import { diseaseUrgency } from '../../../../utils/dataDic';
import { useHistory, useModel } from 'umi';

interface Iprops {
  isModalVisible?: boolean;
  imgId: string;
  address: string;
  onRef: any;
  hideModal?: () => void;
  style: { x: number; y: number };
  // taskType: any;
}

interface lsType {
  diseaseNameZh: string;
  area: string;
  length: string;
  collectTime: string;
  diseaseType: string;
  imgNo: string;
  diseaseNo: string;
  id: number;
}

const ls: lsType[] = [];

const CustomMappop: React.FC<Iprops> = (props: Iprops) => {
  const [imgUrl, setImgUrl] = useState('');
  const { initialState }: any = useModel('@@initialState');
  const [data, setData] = useState({ ls });
  const [distressIndex, setDistressIndex] = useState(0);
  const [diseaseData, setDiseaseData] = useState<any>({ ls });
  const { address, imgId } = props;
  const [visibleFlag, setVisibleFlag] = useState<any>(false);

  const history = useHistory();
  useEffect(() => {
    setVisibleFlag(props.isModalVisible);
  }, [props.isModalVisible]);
  useEffect(() => {
    async function fetchData() {
      const diseaTypes = initialState.PDiseaseTypes;
      const response = await getDiseaseInfo(imgId, diseaTypes);
      if (response.status === 0) {
        setData(response.data);
      } else {
        // message.error({
        //   content: response.message,
        //   key: response.message,
        // });
        return;
      }
      const list: any = [];
      const obj: any = {
        url: '',
        ls: [],
      };
      obj.url = response.data.url;
      response.data.ls.forEach((i: any, ind: any) => {
        if (i.diseaseType !== 5 && i.diseaseType !== 6) {
          if (distressIndex === ind) {
            list.push(i);
          } else {
            list.push({});
          }
        }
      });
      obj.ls = list;
      setDiseaseData(obj);
    }
    if (imgId) {
      fetchData();
    }
  }, [imgId, distressIndex]);
  useEffect(() => {
    setDistressIndex(0);
  }, []);
  const previewBigImg = (url: string) => {
    setImgUrl(url);
  };

  const switchDisease = (page: number) => {
    setDistressIndex(page - 1);
  };
  const getRouteMode = (detInfo: any) => {
    let name = '';
    /* eslint-disable */
    if (Object.keys(detInfo)?.length > 0) {
      name = detInfo?.routeMode * 1 === 0 ? '上行' : detInfo?.routeMode * 1 === 1 ? '下行' : '';
    }
    return `${detInfo.imgNo ? detInfo.imgNo : ''} ${detInfo.imgNo ? name : ''}`;
  };
  // <span style={{float: 'right'}}>详情</span>
  const titleNode = () => <div>病害信息</div>;

  const resetClosableFlag = (flag: boolean) => {
    setVisibleFlag(flag);
  };
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    resetClosableFlag,
  }));

  return (
    <>
      <Modal
        title={titleNode()}
        open={visibleFlag}
        mask={false}
        footer={null}
        // style={{left: style.x, top: style.y, transform: 'translate(-50%)', margin: 'unset'}}
        onCancel={props.hideModal}
        className={styles['map-pop-modal']}
      >
        <Image className="map-pop-img" width={160} height={160} src={imgUrl} placeholder={true} />
        {data ? <DistressCanvas setImgUrl={previewBigImg} data={diseaseData} /> : ''}
        <div className="map-pop-content">
          <div>采集时间：{diseaseData.ls[distressIndex]?.collectTime}</div>
          <div>病害编号：{diseaseData.ls[distressIndex]?.diseaseNo}</div>
          <div>病害类型：{diseaseData.ls[distressIndex]?.diseaseNameZh}</div>
          <div>
            严重程度：
            <span
              style={{
                color:
                  diseaseUrgency[diseaseData.ls[distressIndex]?.diseaseType] === '紧急'
                    ? 'red'
                    : '',
              }}
            >
              {diseaseUrgency[diseaseData.ls[distressIndex]?.diseaseType] || '未知'}
            </span>
          </div>
          {diseaseData.ls[distressIndex]?.diseaseType == 14 ? (
            <div>
              跳车高度：
              {diseaseData.ls[distressIndex]?.displacement
                ? Number(diseaseData.ls[distressIndex]?.displacement).toFixed(3)
                : 0}{' '}
              cm
            </div>
          ) : (
            <>
              <div>
                病害面积：
                {diseaseData.ls[distressIndex]?.diseaseType === 9 ||
                diseaseData.ls[distressIndex]?.diseaseType === 12
                  ? '-'
                  : `${
                      diseaseData.ls[distressIndex]?.area
                        ? (diseaseData.ls[distressIndex]?.area * 1).toFixed(3)
                        : 0
                    } m²`}
              </div>
              <div>
                长度：
                {diseaseData.ls[distressIndex]?.diseaseType === 9 ||
                diseaseData.ls[distressIndex]?.diseaseType === 12
                  ? '-'
                  : `${
                      diseaseData.ls[distressIndex]?.length
                        ? (diseaseData.ls[distressIndex]?.length * 1).toFixed(3)
                        : 0
                    } m`}
              </div>
            </>
          )}
          {Platform_Flag === 'kunming' && diseaseData.ls[distressIndex]?.diseaseType !== 14 ? (
            <div>预估养护费用：10000元</div>
          ) : (
            ''
          )}
          <div>
            桩号：{diseaseData.ls[distressIndex] && getRouteMode(diseaseData.ls[distressIndex])}
          </div>
          <div>
            病害位置：
            <div className="address" title={address}>
              {address}
            </div>
          </div>
        </div>
        <a
          className="aDet"
          onClick={() => {
            sessionStorage.setItem(
              'diseaseObj',
              `${[
                diseaseData.ls[distressIndex]?.id,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                'Custom',
                undefined,
              ]}`,
            );
            history.push(`/diseasemanage/diseaselist/diseasecard`);
          }}
        >
          详情
        </a>
        <Pagination
          simple
          size="small"
          current={distressIndex + 1}
          defaultPageSize={1}
          total={diseaseData.ls.length}
          className={styles.pagination}
          style={{ textAlign: 'right' }}
          onChange={switchDisease}
        />
      </Modal>
    </>
  );
};

export default CustomMappop;
