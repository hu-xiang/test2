import React, { useState, useEffect, useRef } from 'react';
// import { openInfo } from './mapInfoWindow';
// import DistressCanvas from '@/pages/TaskList/component/DistressCanvas';
// import CustomMappop from './CustomMappop';
import { useModel } from 'umi';
// import { mapdatas } from '../testData';
import styles from '../styles.less';
import pointSvg from '../../../../../public/images/map-ppoint-normal.svg';
import pointBigSvg from '../../../../../public/images/map-ppoint-bigger.svg';
import tcSvg from '../../../../../public/images/tc-normal.svg';
import tcBigSvg from '../../../../../public/images/tc-bigger.svg';
import RightSearch from './mapRightSearch';
import { getMapInfo } from '../service';
import DraggerModal from './DraggerModal';
import Request from 'umi-request';

// import ReactDOM from 'react-dom';
// interface Iprops {
// mapData: any[];
// fkFacilitiesId: any;
// taskType: any;
// }
interface searchParamType {
  diseaseType?: any[];
  startTime?: string;
  endTime?: string;
}
// let idistrict: any = null;
let map: any = null;
let mapCluster: any = null;
const iconNormalMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(24, 24),
  // 图标的取图地址
  image: pointSvg,
  // 图标所用图片大小
  imageSize: new AMap.Size(24, 24),
  // 图标取图偏移量
  // imageOffset: new AMap.Pixel(-14, -28)
});
const iconBigMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(40, 40),
  // 图标的取图地址
  image: pointBigSvg,
  // 图标所用图片大小
  imageSize: new AMap.Size(40, 40),
});
const iconTcMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(24, 24),
  // 图标的取图地址
  image: tcSvg,
  // 图标所用图片大小
  imageSize: new AMap.Size(24, 24),
  // 图标取图偏移量
  // imageOffset: new AMap.Pixel(-14, -28)
});
const iconTcBigMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(40, 40),
  // 图标的取图地址
  image: tcBigSvg,
  // 图标所用图片大小
  imageSize: new AMap.Size(40, 40),
});
let prevMarker: any = null;
const normalOffset = new AMap.Pixel(-12, -24);
const bigOffset = new AMap.Pixel(-20, -40);

const Map: React.FC = () => {
  const { fkId } = useModel<any>('trend');
  const { CancelToken } = Request;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imgId, setImgId] = useState('');
  const [mapData, setMapData] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const controlRef = useRef<any>();
  const [searchParams, setSearchParams] = useState<searchParamType>();
  // const [isMapShow, setIsMapShow] = useState<boolean>(false);
  // const { mapData, fkFacilitiesId } = props;
  const childRef: any = useRef();
  // const intl = useIntl();
  const { AMap }: any = window;
  const handleAbort = () => {
    if (controlRef && controlRef?.current) {
      controlRef?.current();
      controlRef.current = null;
    }
  };
  const hideModal = () => {
    setIsModalVisible(false);
    if (prevMarker) {
      const preicon = prevMarker?.type === 14 ? iconTcMarker : iconNormalMarker;
      prevMarker.marker.setIcon(preicon);
      prevMarker.marker.setTop(false);
      prevMarker.marker.setOffset(normalOffset);
      prevMarker = undefined;
    }
  };

  // const getData = (data: any) => {
  //   const pathArray: any[] = [];
  //   /* eslint-disable */
  //   pathArray?.push?.apply(pathArray, data);
  //   const polygon = new AMap.Polygon({
  //     path: pathArray,
  //     strokeColor: '#3758FF',
  //     strokeWeight: 3,
  //     fillColor: '#0b0e18',
  //     fillOpacity: 0,
  //   });
  //   /* eslint-enable */
  //   map.add(polygon);
  // };

  // const drawPloygon = (code: any) => {
  //   idistrict.setLevel('city'); // 行政区级别
  //   idistrict.setExtensions('all');
  //   idistrict.search(code, (status: any, result: any) => {
  //     if (status === 'complete') {
  //       const boundDatas = result.districtList[0].boundaries;
  //       getData(boundDatas);
  //     }
  //   });
  // };

  useEffect(() => {
    // const center: any = [114.058141, 22.543544];
    const mapCenter: any = localStorage?.getItem('map-center');
    const center: any = JSON.parse(mapCenter);
    const zoom = 10;
    // if (mapData?.length) {
    //   center = [mapData[0].longitude, mapData[0].latitude];
    //   zoom = 13;
    // }
    map = new AMap.Map('trendContainer', {
      zoom,
      center,
      mapStyle: 'amap://styles/macaron',
    });
    // 高亮显示省市区域
    // const province = localStorage?.getItem('use-province');
    // const city = localStorage?.getItem('use-city');
    // if (province) {
    //   if (Platform_Flag === 'boshilin') {
    //     // 博士林区也要高亮画线
    //     const opts = {
    //       // level: 'province',
    //       subdistrict: 1, // 返回下一级行政区
    //       extensions: 'all',
    //       showbiz: false, // 最后一级返回街道信息
    //     };
    //     AMap.plugin('AMap.DistrictSearch', () => {
    //       idistrict = new AMap.DistrictSearch(opts);
    //       idistrict.search(province, (status: any, result: any) => {
    //         if (status === 'complete') {
    //           const outer = [
    //             new AMap.LngLat(-360, 90, true),
    //             new AMap.LngLat(-360, -90, true),
    //             new AMap.LngLat(360, -90, true),
    //             new AMap.LngLat(360, 90, true),
    //           ];
    //           const holes = result.districtList[0].boundaries;

    //           const pathArray = [outer];
    //           // eslint-disable-next-line
    //           pathArray.push.apply(pathArray, holes);
    //           const polygon = new AMap.Polygon({
    //             path: pathArray,
    //             strokeColor: '#3758FF',
    //             strokeWeight: 3,
    //             fillColor: '#0b0e18',
    //             // fillOpacity: 0.6,
    //             fillOpacity: 0,
    //           });
    //           map.add(polygon);
    //           if (result.districtList[0]?.districtList?.length > 0) {
    //             result.districtList[0]?.districtList.forEach((it: any) => {
    //               if (it?.adcode) {
    //                 drawPloygon(it?.adcode);
    //               }
    //             });
    //           }
    //         }
    //       });
    //     });
    //   } else {
    //     AMap.plugin('AMap.DistrictSearch', () => {
    //       new AMap.DistrictSearch({
    //         level: 'province',
    //         extensions: 'all',
    //         subdistrict: 1,
    //       }).search(city, (status: any, result: any) => {
    //         // 外多边形坐标数组和内多边形坐标数组
    //         const outer = [
    //           new AMap.LngLat(-360, 90, true),
    //           new AMap.LngLat(-360, -90, true),
    //           new AMap.LngLat(360, -90, true),
    //           new AMap.LngLat(360, 90, true),
    //         ];
    //         // console.log('result', result.districtList);
    //         const holes = result.districtList[0].boundaries;

    //         const pathArray = [outer];
    //         /* eslint-disable */
    //         pathArray.push.apply(pathArray, holes);
    //         /* eslint-enable */
    //         const polygon = new AMap.Polygon({
    //           path: pathArray,
    //           strokeColor: '#3758FF',
    //           strokeWeight: 3,
    //           fillColor: '#050811',
    //           // fillOpacity: 0.8,
    //           fillOpacity: 0,
    //         });
    //         map.add(polygon);
    //       });
    //     });
    //   }
    // }

    map.on('click', () => {
      // if (childRef && childRef.current) {
      //   childRef.current?.resetClosableFlag(false);
      // }
      // setIsModalVisible(false);
      // if (prevMarker) {
      //   const preicon = prevMarker?.type === 14 ? iconTcMarker : iconNormalMarker;
      //   prevMarker.marker.setIcon(preicon);
      //   prevMarker.marker.setTop(false);
      //   prevMarker = undefined;
      // }
      hideModal();
    });

    return () => {
      // idistrict = null;
    };
  }, []);

  useEffect(() => {
    // const getFacilitiesList = async () => {
    //   let rec: any = [];
    //   try {
    //     // const { status, data = [] } = await getFacilitityList({ name: '' });
    //     const { status, data = [] } = { status: 0, data: mapdatas };
    //     if (status === 0) {
    //       // data.forEach((it: any) => {
    //       //   rec.push({ label: it.facilitiesName, value: it.id });
    //       // });
    //       rec = data;
    //     }
    //     setMapData(rec);
    //   } catch (error) {
    //     console.log('error');
    //   }
    // };
    // getFacilitiesList();
    hideModal();
  }, [fkId]);

  useEffect(() => {
    const gridSize = 60;
    // 数据中需包含经纬度信息字段 lnglat
    if (!mapData || !mapData.length) {
      if (mapCluster) {
        mapCluster.setMap(null);
      }
      return;
    }

    const count = mapData.length;

    // 根据不同条件聚合数据
    const renderClusterMarker = (context: any) => {
      const div = document.createElement('div');

      let bgColor = `rgba(137, 203, 155, 0.85)`;
      let size = 40;
      if (context.count > 200) {
        bgColor = 'rgba(235, 125, 87, 0.85)';
        size = 100;
      } else if (context.count > 50 && context.count <= 200) {
        bgColor = 'rgba(242, 201, 53, 0.85)';
        size = 80;
      } else if (context.count > 10 && context.count <= 50) {
        bgColor = 'rgba(70, 132, 247, 0.85)';
        size = 60;
      }

      const fontColor = `#fff`;
      div.style.backgroundColor = bgColor;
      size = Math.round(30 + (context.count / count) ** (1 / 5) * 25);
      // eslint-disable-next-line no-multi-assign
      div.style.width = div.style.height = `${size}px`;
      div.style.borderRadius = `${size / 2}px`;
      div.innerHTML = context.count;
      div.style.lineHeight = `${size}px`;
      div.style.color = fontColor;
      div.style.fontSize = '14px';
      div.style.textAlign = 'center';
      context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
      context.marker.setContent(div);
      context.marker.on('click', (event: any) => {
        const curZoom = map.getZoom();
        map.setZoomAndCenter(curZoom + 3, event.lnglat);
      });
    };
    const renderMarker = (context: any) => {
      let offset = normalOffset;
      let iconMarker = context.data[0]?.diseaseType === 14 ? iconTcMarker : iconNormalMarker;
      if (prevMarker) {
        if (prevMarker?.id && context.data?.length && prevMarker?.id === context.data[0]?.id) {
          const iconPre = prevMarker?.type === 14 ? iconTcBigMarker : iconBigMarker;
          iconMarker = iconPre;
          offset = bigOffset;
          const newmarker = context.marker;
          newmarker.setTop(true);
          prevMarker = {
            marker: newmarker,
            id: context.data[0]?.id,
            type: context.data[0]?.diseaseType,
          };
        }
      }
      context.marker.bubble = true;
      context.marker.setTop(false);
      context.marker.setIcon(iconMarker);
      context.marker.setOffset(offset);
      context.marker.on('click', (event: any) => {
        if (
          prevMarker &&
          prevMarker?.id &&
          context.data?.length &&
          prevMarker?.id !== context.data[0]?.id
        ) {
          const preicon = context.data[0]?.diseaseType === 14 ? iconTcMarker : iconNormalMarker;
          prevMarker.marker.setIcon(preicon);
          prevMarker.marker.setTop(false);
        }
        // setModalStyle(event.pixel);
        setImgId(context.data[0]?.fkImgId);
        setIsModalVisible(true);
        prevMarker = {
          marker: event.target,
          id: context.data[0]?.id,
          type: context.data[0]?.diseaseType,
        };
        event.target.setTop(true);
        const icon = context.data[0]?.diseaseType === 14 ? iconTcBigMarker : iconBigMarker;
        event.target.setIcon(icon);
        event.target.setOffset(bigOffset);
        AMap.plugin('AMap.Geocoder', () => {
          const geocoder = new AMap.Geocoder();
          geocoder.getAddress(context.data[0].lnglat, (status: string, result: any) => {
            if (status === 'complete' && result.info === 'OK') {
              // result为对应的地理位置详细信息
              setAddress(result.regeocode.formattedAddress);
            } else {
              setAddress('');
              console.log('根据经纬度查询地址失败');
            }
          });
        });
      });
    };
    function addCluster() {
      AMap.plugin('AMap.MarkerCluster', () => {
        // 异步加载插件
        // eslint-disable-next-line no-new
        mapCluster = new AMap.MarkerCluster(map, mapData, {
          gridSize, // 设置网格像素大小
          renderClusterMarker, // 自定义聚合点样式
          renderMarker, // 自定义非聚合点样式
        });
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    if (mapCluster) {
      // console.log("%cmapdata清空","color: red; font-style: italic; background-color: white;padding: 2px")
      mapCluster.setMap(null);
    }
    addCluster();
    if (mapData && mapData.length > 0) {
      map.setCenter([mapData[0].longitude, mapData[0].latitude]);
    } else {
      const mapCenter: any = localStorage?.getItem('map-center');
      const center: any = JSON.parse(mapCenter);
      map.setCenter(center);
      // map.setCenter([114.058141, 22.543544]);
    }
  }, [mapData]);

  const handleSearch = async (params: {
    selectVals?: any[];
    startTime?: string;
    endTime?: string;
  }) => {
    setSearchParams({
      diseaseType: params?.selectVals,
      startTime: params?.startTime,
      endTime: params?.endTime,
    });
  };
  useEffect(() => {
    let isUnmounted = false;
    const getMapInfoDatas = async (paramInfo: any) => {
      const res = await getMapInfo(
        { facilitiesId: fkId, ...paramInfo },
        {
          cancelToken: new CancelToken(function executor(c) {
            controlRef.current = c;
          }),
        },
      );
      if (!isUnmounted && res?.status === 0) {
        setMapData(res.data);
      }
    };
    handleAbort();
    getMapInfoDatas(searchParams);
    // getMapInfoDatas({diseaseType:[],startTime: "2022-09-07",endTime:'2022-09-14'});
    return () => {
      isUnmounted = true;
    };
  }, [searchParams]);

  return (
    <>
      <div className={styles['head-search']}>
        <RightSearch handleSearch={handleSearch} />
      </div>
      <div id="trendContainer" className={styles.container} />
      {isModalVisible ? (
        <DraggerModal
          isModalVisible={isModalVisible}
          hideModal={hideModal}
          imgId={imgId}
          onRef={childRef}
          address={address}
        />
      ) : null}
    </>
  );
};
export default Map;
