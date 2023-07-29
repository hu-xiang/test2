import { Image, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './styles.less';
// import HiddenScenario from './components/HiddenScenario';
import Line from './components/BaseLine';
import { useHistory } from 'umi';
import { getDetailInfo } from './service';

let map: any = null; // 全局map
const markers: any = [];
let layer: any = null;

type Iprops = {
  a?: string;
};

const Detail: React.FC<Iprops> = () => {
  const [hiddenDangerList, setHiddenDangerList] = useState<any>([]);
  const [sceneTypeList, setSceneTypeList] = useState<any>([]);
  const [detailInfo, setDetailInfo] = useState<any>();

  const history = useHistory();
  // const urlParams: any = useParams();

  const { AMap }: any = window;

  const markerGray = 'images/mapScenes/markerGray.png';
  const markerGreen = 'images/mapScenes/markerGreen.png';
  const markerRed = 'images/mapScenes/markerRed.png';

  const handleRenderLaberMarker = (curPos: any, icon: any) => {
    const curData = {
      position: curPos,
      icon,
      zooms: [2, 30],
    };
    const labelMarker = new AMap.LabelMarker(curData);
    markers.push(labelMarker);
  };

  const handleRenderMapMarker = (resData: any) => {
    if (resData.length < 1) return;

    // 创建 AMap.LabelsLayer 图层
    layer = new AMap.LabelsLayer({
      zooms: [3, 30],
      zIndex: 1000,
      collision: false,
    });

    // 将图层添加到地图
    map.add(layer);

    const icon = {
      type: 'image',
      image: markerGray,
      size: [22, 30],
      anchor: 'bottom-center',
    };

    // 渲染海量点
    for (let i = 0; i < resData.length; i++) {
      if (resData[i].geoStatus === 1) {
        icon.image = markerRed;
      }
      if (resData[i].geoStatus === 2) {
        icon.image = markerGreen;
      }
      handleRenderLaberMarker([resData[i].longitude, resData[i].latitude], icon);
    }

    // 一次性将海量点添加到图层
    layer.add(markers);
    // 设置地图中心
    const index = Math.floor(resData.length / 2);
    const center = [resData[index].longitude, resData[index].latitude];
    map.setCenter(center);
  };

  // 获取详情
  const handleGetDetailInfo = async () => {
    const projectId = sessionStorage.getItem('checkList_proId');
    const res = await getDetailInfo({ projectId });
    if (res.status === 0) {
      setDetailInfo(res?.data);
      setHiddenDangerList(res?.data?.hiddenDangerList);
      setSceneTypeList(res?.data?.sceneTypeList);

      handleRenderMapMarker(res?.data?.list || []);
    }
  };
  useEffect(() => {
    handleGetDetailInfo();
  }, []);

  const handleGoBack = () => {
    history.go(-1);
  };

  useEffect(() => {
    // // mock 柱状图数据
    // setChartData([
    //   { label: 'a1', value: 1 },
    //   { label: 'a2', value: 2 },
    //   { label: 'a3', value: 3 },
    //   { label: 'a4', value: 3 },
    //   { label: 'a5', value: 3 },
    //   { label: 'a6', value: 3 },
    // ]);
  }, []);

  // 地图相关
  useEffect(() => {
    map = new AMap.Map('container', {
      zoom: 16,
      center: [102.847977, 25.11826],
      // mapStyle: 'amap://styles/5cfb475a7621dccba5ff381b2f3c8ab4',
    });
    console.log(map);
  }, []);
  return (
    <div className={styles.detailsWrapper}>
      <div className={styles.backList} onClick={() => handleGoBack()}>
        <Image src={'images/back.svg'} preview={false} /> <span>项目列表</span>
      </div>
      <div className={styles.detailContentWrapper}>
        <div className={styles.subTitle}>
          <span>项目详情-{detailInfo?.projectNo}</span>
        </div>
        <div className={styles.detailsContentInner}>
          <div className={styles.baseInfo}>
            <div className={styles.typeTitle}>基本信息</div>
            <div className={styles.baseInfoContent}>
              <div className={styles.item}>
                <span className={styles.label}>项目名称</span>
                <span className={styles.val}>
                  <Input disabled value={detailInfo?.projectName}></Input>
                </span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>道路名称</span>
                <span className={styles.val}>
                  <Input disabled value={detailInfo?.facilitiesName}></Input>
                </span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>道路类别</span>
                <span className={styles.val}>
                  <Input disabled value={detailInfo?.roadType}></Input>
                </span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>道路等级</span>
                <span className={styles.val}>
                  <Input disabled value={detailInfo?.roadLevel}></Input>
                </span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>起点</span>
                <span className={styles.val}>
                  <Input disabled value={detailInfo?.startPoint}></Input>
                </span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>终点</span>
                <span className={styles.val}>
                  <Input disabled value={detailInfo?.endPoint}></Input>
                </span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>图片库名称</span>
                <span className={styles.val}>
                  <Input disabled value={detailInfo?.libraryName}></Input>
                </span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>排查状态</span>
                <span className={styles.val}>
                  <Input
                    disabled
                    value={detailInfo?.checkStatus === 1 ? '已完成' : '未完成'}
                  ></Input>
                </span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>创建时间</span>
                <span className={styles.val}>
                  <Input disabled value={detailInfo?.crtTime}></Input>
                </span>
              </div>
            </div>
          </div>
          <div className={styles.dataDetail}>
            <div className={styles.typeTitle}>数据详情</div>
            <div className={styles.dataDetailContent}>
              <div className={styles.dataDetailInfo}>
                <div className={styles.upList}>
                  <div>上行：</div>
                  <div style={{ marginRight: '10px' }}>
                    <span className={styles.label}>起点</span>
                    <span className={styles.val}>{detailInfo?.startPoint}</span>
                  </div>
                  <div>
                    <span className={styles.label}>终点</span>
                    <span className={styles.val}>{detailInfo?.endPoint}</span>
                  </div>
                </div>
                <div className={styles.downList}>
                  <div>下行：</div>
                  <div style={{ marginRight: '10px' }}>
                    <span className={styles.label}>起点</span>
                    <span className={styles.val}>{detailInfo?.startPoint}</span>
                  </div>
                  <div>
                    <span className={styles.label}>终点</span>
                    <span className={styles.val}>{detailInfo?.endPoint}</span>
                  </div>
                </div>
              </div>
              <div id={'container'} className={styles.detailPageMapArea}></div>
            </div>
          </div>

          <div>
            <div className={styles.typeTitle}>统计分析</div>
            <div className={styles.lineTitle}>场景类型统计</div>
            <div className={styles.chartWrapper}>
              <Line data={sceneTypeList} />
            </div>
          </div>
          <div>
            <div className={styles.lineTitle}>隐患类型统计</div>
            <div className={styles.chartWrapper}>
              <Line data={hiddenDangerList} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
