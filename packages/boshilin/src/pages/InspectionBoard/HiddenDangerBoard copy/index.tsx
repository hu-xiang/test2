import BoardRight from './components/boardRight';
import React, { useState, useEffect, useRef } from 'react';
import { Select } from 'antd';
import { useModel } from 'umi';
// import type { InputRef } from 'antd';
import headLogo from '@/assets/img/InspectionBoard/head/logo.svg';
import bottomLogo from '@/assets/img/InspectionBoard/bottom/bottomlogo.png';
// import searchIcon from '@/assets/img/InspectionBoard/head/search.svg';
import EmptyPage from 'baseline/src/components/EmptyPage';
import { SearchOutlined } from '@ant-design/icons';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';
import HeadTop from 'baseline/src/pages/InspectionBoard/components/headTop';
import HeadBottom from 'baseline/src/pages/InspectionBoard/components/HeadBottom';
import EvaMap from './components/map';
import BoardLeft from './components/boardLeft';
import Request from 'umi-request';
// import {} from './components/boardLeft';
import { roadFlagType, accidentType } from './data.d';
import {
  getProjectList,
  getMapDetail,
  getLastProjectId,
  getSceneTreeList,
  getImgListInfo,
  getSCeneMapDatas,
  // getSCeneTypeMapDatas,
  queryStake,
} from './service';
import propStyles from './styles.less';
import { history } from 'umi';
import DebounceSelect from 'baseline/src/components/DebounceSelect';
// import EmptyPage from 'baseline/src/components/EmptyPage';
import baseStyles from 'baseline/src/pages/InspectionBoard/components/HeadBottom/styles.less';
// import { mapProj2Data, imgDatas } from './components/testData';
import ViewIndex from './components/viewIndex';

const copyright = '版权所有 © 河北博士林科技开发有限公司';
const poweredBy = '© Powered by smartmore';
const logoDesc = '道路病害检测智能管理平台';
// const { Option } = Select;
type itemType = {
  label: string;
  value: string | number;
};
type treeType = { title: string; key: string; children: any[]; level: string; extraInfo: any };
type leftInfo = {
  roadInfo: any;
  sceneStatisticsList: any[];
  hiddenStatisticsList: any[];
  facNums: any[];
};
// const accidentStatus = {
//   轻微: 0,
//   一般: 0,
//   严重: 0,
//   重大: 0,
// };
// type rightInfo={
//   accidentData: any[]
// }
const { Option } = Select;
const { CancelToken } = Request;
type Iprops = {};
// let isView=false;
const HiddenDangerBoard: React.FC<Iprops> = () => {
  const { nodeType, setNodeType } = useModel<any>('hiddenboard');
  // const filterAddress = useRef<InputRef>(null);
  const hiddenRef = useRef<any>();
  const [mapData, setMapData] = useState<any>([]);
  const { setLnglatArr, setResetColorFlag } = useModel<any>('facility');
  const mapRef: any = useRef<any>();
  const { inspectType, setInspectType } = useModel<any>('inspect');
  const [expandDatas, setExpandDatas] = useState<any[]>([]);
  // const [nodeType, setNodeType] = useState<string>('road');
  // const UserMessage = React.createContext({});
  // const [firstImgUrl,setFirstImgUrl]=useState<string>('');
  const nodeTypeRef: any = useRef<any>();
  const selectRef: any = useRef<typeof DebounceSelect>();
  const [selectAddress, setSelectAddress] = useState<any>();
  const [dataLeftInfo, setDataLeftInfo] = useState<leftInfo>();
  const [rightInfoData, setRightInfoData] = useState<any>();
  const [selectTreeData, setSelectTreeData] = useState<any[]>([]);
  const [locationOpts, setLocationOpts] = useState<any[]>([]);
  const [mapType, setMapType] = useState('3d');
  const newInterval: any = useRef(0);
  const [theme, setTheme] = useState<string>('black');
  // const childRef: any = useRef();
  const [projectId, setProjectId] = useState<string>('');
  const [facId, setFacId] = useState<string>('');
  const [roadId, setRoadId] = useState<string>('');
  const [railData, setRailData] = useState<any[]>([]);
  const [sceneTrailData, setSceneTrailData] = useState<any[]>([]);
  const [isRefresh, setIsRefresh] = useState<boolean>(false);
  const [defalutProjId, setDefalutProjId] = useState<string>('');
  const [sceneDatas, setSceneDatas] = useState<itemType[]>([]);
  const [isView, setIsView] = useState<boolean>(false);
  const [imgDataList, setImgDataList] = useState<any>([]);
  const [imgIndex, setImgIndex] = useState<number>(0);
  const [detectionType, setDetectionType] = useState<string>('inspectionBoard');
  // const [searchLocationValue, setSearchLocationValue] = useState<any>('');
  // console.log('nodetypeindex', nodeType);
  useEffect(() => {
    nodeTypeRef.current = nodeType;
  }, [nodeType]);
  const handleDetetion = (str: string) => {
    setInspectType(str);
    if (str) {
      const toUrl = `/${str}`;
      history.push(toUrl);
    }
  };

  useEffect(() => {
    if (!inspectType) {
      setDetectionType(history.location?.pathname.replace('/', ''));
    } else {
      setDetectionType(inspectType);
    }
  }, [inspectType]);

  const getInfo = async (sceneVal: any, projectVal: any) => {
    if (!projectVal) {
      return;
    }

    const { status, data = [] } = await getMapDetail({
      // projectId: projectVal,
      projectId: projectVal,
      proFacId: facId,
    });
    // console.log('getInfo', facid, projectVal, data);
    if (status === 0) {
      setMapData(
        data?.trackPointList?.length && data?.trackPointList[0] ? data?.trackPointList : [],
      );
      const roadData = {
        left: {
          fkFacName: { key: 0, label: '道路名称', value: data?.fkFacName },
          startPoint: { key: 1, label: '道路起点', value: data?.startPoint },
          roadLevel: { key: 2, label: '道路等级', value: data?.roadLevel },
          laneNum: { key: 3, label: '车道数', value: data?.laneNum },
        },
        right: {
          roadType: { key: 4, label: '道路类别', value: data?.roadType },
          endPoint: { key: 5, label: '道路终点', value: data?.endPoint },
          roadNum: { key: 6, label: '道路里程', value: data?.roadNum },
        },
      };
      let newFacNums = [];
      let isAllZero = false;
      if (data?.ancillaryFacilitiesList && data?.ancillaryFacilitiesList?.length > 0) {
        newFacNums = isAllZero
          ? []
          : data?.ancillaryFacilitiesList?.map((it: any) => {
              if (!isAllZero) {
                isAllZero = it?.num > 0;
              }
              return { type: it?.type, nums: it?.num };
            });
      }
      setDataLeftInfo({
        roadInfo: roadData,
        sceneStatisticsList: data?.sceneTypeStatisticsList,
        hiddenStatisticsList: data?.hiddenDangerStatisticsList,
        facNums: newFacNums,
      });
      if (data?.accidentStatisticsList && Object.keys(data?.accidentStatisticsList)?.length > 0) {
        const newRightInfo = {};
        Object.keys(data?.accidentStatisticsList)?.forEach((it: any) => {
          if (data?.accidentStatisticsList[it] && data?.accidentStatisticsList[it]?.length) {
            const newData = Object.keys(accidentType).map((itm: any) => {
              const item = data?.accidentStatisticsList[it]?.find(
                (itn: any) => itn?.type?.toString() === itm?.toString(),
              );
              return item
                ? { type: accidentType[itm], num: item?.num }
                : { type: accidentType[itm], num: 0 };
            });
            newRightInfo[it] = newData;
          }
        });
        const rightInfos: any[] = [];
        if (newRightInfo && Object.keys(newRightInfo)?.length) {
          Object.keys(newRightInfo)
            ?.sort((a: any, b: any) => b - a)
            .forEach((ii: any) => {
              rightInfos.push({ [ii]: newRightInfo[ii] });
            });
        }
        setRightInfoData(rightInfos);
      }
      setIsRefresh(false);
      // if(data?.trackList?.length>0&&mapRef?.current)
      // {
      //  mapRef?.current.setCenterMap(data?.trackList[0]?.lnglat)
      // }
      // if(!isScene)
      // {
      //   // 项目查询
      //   setMapData(data?.trackList);
      //   setDataRightInfo({
      //     facilityName: data?.facilitiesName,
      //     roadLevel: data?.roadLevel,
      //     roadType: data?.roadType,
      //     sceneStatisticsList: data?.sceneTypeStatisticsList,
      //     hiddenStatisticsList: data?.hiddenDangerStatisticsList,
      //   });
      // }
      // else{
      //    // 场景查询
      //    /* eslint-disable */
      //    if(data?.trackList?.length>0&&mapRef?.current)
      //    {
      //     // console.log('dkkkk',data?.trackList[0]?.lnglat);
      //     mapRef?.current.setCenterMap(data?.trackList[0]?.lnglat)
      //    }
      // }
    }
  };
  // 获取图片数据
  const getImgListInfos = async (facid: string) => {
    const { status, data = [] } = await getImgListInfo({ proFacId: facid });
    if (status === 0) {
      setImgDataList(data);
    }
  };
  // 获取场景树
  const getSCeneData = async (projId: any, isFlag: boolean = false) => {
    // console.log('进来场景树', projId);
    if (!projId) {
      return;
    }
    const rec: any = await getSceneTreeList({ projectId: projId });
    if (rec?.status === 0) {
      const recData =
        rec?.data?.length &&
        rec?.data?.map((it: any, index: number) => {
          if (index === 0) {
            if (
              isFlag &&
              facId === (rec?.data[0]?.list?.length && rec?.data[0]?.list[0]?.proFacId)
            ) {
              setIsRefresh(true);
            }
            setFacId(rec?.data[0]?.list?.length && rec?.data[0]?.list[0]?.proFacId);
            setRoadId(rec?.data[0]?.list?.length && rec?.data[0]?.list[0]?.id);
            const newFacId = rec?.data[0]?.list[0].proFacId
              ? `fac_${rec?.data[0]?.list[0].proFacId}_${rec?.data[0]?.list[0]?.id}`
              : `fac1`;
            setSelectTreeData([newFacId]);
            setExpandDatas(['road0']);
            setNodeType('fac');
            // handleSceneType('',rec?.data[0]?.list?.length && rec?.data[0]?.list[0]?.proFacId,);
          }
          const item: treeType = {
            title: roadFlagType[it?.grade ? Number(it?.grade) : 1],
            level: 'road',
            extraInfo: null,
            key: it?.id ? it?.id : `road${index}`,
            children: [],
          };
          if (it?.list && it?.list?.length > 0) {
            it?.list?.forEach((itk: any, ind: number) => {
              const facid = itk?.proFacId ? `${itk?.proFacId}` : `${ind + 1}`;
              const roadid = itk?.id ? `${itk?.id}` : `${ind + 1}`;
              const itemFac: treeType = {
                title: itk?.name,
                level: 'fac',
                extraInfo: roadid,
                key: itk?.proFacId ? `fac_${itk?.proFacId}_${itk?.id}` : `fac${ind + 1}`,
                children: [],
              };
              if (itk?.list && itk?.list?.length > 0) {
                itk?.list?.forEach((itm: any, inm: number) => {
                  const itemSceneType: treeType = {
                    title: itm?.name,
                    level: 'sceneType',
                    extraInfo: roadid,
                    key: `${facid}_sceneType${inm + 1}_${roadid}`,
                    children: [],
                  };
                  if (itm?.list && itm?.list?.length) {
                    itm?.list?.forEach((its: any, ins: number) => {
                      const itemScene: treeType = {
                        title: its?.name,
                        level: 'scene',
                        extraInfo: { roadid, sceneTypeName: itm?.name },
                        key: its?.fkKeySceneId
                          ? `${facid}_${its?.fkKeySceneId}_${roadid}`
                          : `scene${ins + 1}`,
                        children: [],
                      };
                      itemSceneType.children.push(itemScene);
                    });
                  }
                  itemFac.children.push(itemSceneType);
                });
              }
              item?.children.push(itemFac);
            });
          }
          return item;
        });
      // console.log('expand',recval);
      // setDefalutExpandKeys(recval);
      setSceneDatas(recData);
    }
  };
  const getLastProjInfo = async () => {
    const recval: any = await getLastProjectId();
    if (recval?.status === 0 && recval?.data) {
      // getImgListInfos(recval?.data);
      getSCeneData(recval?.data);
      setProjectId(recval?.data);
      setDefalutProjId(recval?.data);
      // getInfo('', recval?.data);
    }
  };

  useEffect(() => {
    getLastProjInfo();
    const excludeArr: any[] = ['/inspectionBoard', '/facilityAssets', '/hiddenDangerBoard'];
    if (history?.location?.pathname === '/hiddenDangerBoard') {
      setInspectType('hiddenDangerBoard');
    }
    const unlisten = history.listen((location: any) => {
      if (location.pathname !== '/hiddenDangerBoard') {
        if (!excludeArr.includes(location.pathname)) {
          setInspectType('inspectionBoard');
        }
      }
    });

    return () => {
      unlisten();
    };
  }, []);
  const handleClear = () => {
    setProjectId(defalutProjId);
    // setSceneno(undefined);
    // getInfo(undefined, defalutProjId);
    getSCeneData(defalutProjId);
    // getImgListInfos(defalutProjId);
  };
  const handleAbort = () => {
    if (hiddenRef && hiddenRef?.current) {
      hiddenRef?.current();
      hiddenRef.current = null;
    }
  };
  const getRoadTrail = async (id: any) => {
    handleAbort();
    // console.log('getRoadTrail的id', id)
    let isUnmounted = false;
    const recval: any = await queryStake(
      { facilityId: id },
      {
        cancelToken: new CancelToken(function executor(c) {
          hiddenRef.current = c;
        }),
      },
    );
    isUnmounted = true;
    if (recval?.status === 0 && recval?.data && isUnmounted) {
      setRailData(recval?.data || []);
    }
  };
  const getSCeneMapData = async (
    sceneId: any,
    facNum: string,
    scenename: string,
    nodetype: string,
  ) => {
    // console.log('getSCeneMapData', nodeTypeRef.current,sceneId,facNum)
    const newType: boolean = nodetype === 'scene';
    const rec: any = await getSCeneMapDatas({
      keySceneId: sceneId,
      proFacId: facNum,
      sceneTypeName: scenename,
    });
    if (rec?.status === 0) {
      // if (newType && rec?.data?.trackList?.length > 0) {
      //   const ind: number = Math.floor(rec?.data?.trackList?.length / 2);
      //   // console.log('具体场景',ind,rec?.data?.trackList[ind]?.lnglat )
      //   setSceneTrailData(rec?.data?.trackList || []);
      //   if (mapRef?.current) {
      //     mapRef?.current.setCenterMap(rec?.data?.trackList[ind]?.lnglat);
      //   }
      //   return;
      // }
      if (rec?.data?.length) {
        setSceneTrailData(rec?.data || []);
        let newCenter: any[] = [];
        if (newType && rec?.data[0]?.trackList?.length > 0) {
          newCenter = [rec?.data[0]?.longitude, rec?.data[0]?.latitude];
        } else {
          /* eslint-disable */
          if (rec?.data[0]?.downList?.length) {
            newCenter =
              rec?.data[0]?.downList[Math.floor(rec?.data[0]?.downList?.length / 2)]?.lnglat;
          } else if (rec?.data[0]?.upList?.length) {
            newCenter = rec?.data[0]?.upList[Math.floor(rec?.data[0]?.upList?.length / 2)]?.lnglat;
          } else {
            newCenter = [];
          }
        }
        // const newCenter=rec?.data[0]?.downList?.length?rec?.data[0]?.downList[Math.floor(rec?.data[0]?.downList?.length/2)]?.lnglat:(rec?.data[0]?.upList?.length?rec?.data[0]?.upList[Math.floor(rec?.data[0]?.upList?.length/2)]?.lnglat:[]); // eslint-disable-line
        // console.log('newCenter', newCenter)
        if (mapRef?.current && newCenter?.length) {
          mapRef?.current.setCenterMap(newCenter);
        }
      }
      // console.log('rec关于场景', rec?.data);
    }
  };
  // 点击了场景类型
  const handleSceneType = (facid: any, roadid: any, name: string) => {
    // console.log('handleSceneType',facid,facId,roadid,name);
    if (facid !== facId) {
      setFacId(facid);
    }
    if (roadid !== roadId) {
      setRoadId(roadid);
    }
    getSCeneMapData('', facid, name, 'sceneType');
  };
  // 设施切换
  const handleSearchData = (id: any, roadid: any) => {
    getInfo(id, projectId);
    getImgListInfos(id);
    if (roadid) {
      getRoadTrail(roadid); // 获取场景类型轨迹
    }
  };
  useEffect(() => {
    // 设施切换，要清空轨迹线
    if (facId) {
      // console.log('设施id变动或者设施项目id变动',facId,roadId);
      // if (mapRef?.current) {
      //   mapRef?.current.clearAllPolyline();
      // }
      handleSearchData(facId, roadId);
    }
  }, [facId, roadId]);
  useEffect(() => {
    if (isRefresh) {
      handleSearchData(facId, roadId);
    }
  }, [isRefresh]);
  // useEffect(() => {
  // 选择场景，只把地图中心点移到对应的位置
  // if (sceneno && sceneno.indexOf('p') === -1) {
  //   getInfo(sceneno, projectId);
  // } else if (!sceneno) {
  //   getInfo('', projectId);
  // }

  // }, [sceneno]);

  const handleFullScreen = () => {};

  const handleMapStyle = (type: string) => {
    setMapType(type);
  };

  // 设施点击
  const handleFac = (val: string, nroad: string) => {
    // console.log('handlefac',val,facId);
    if (val === facId && mapRef && mapRef?.current) {
      mapRef?.current.clearSceneTrail();
    }
    setFacId(val);
    setRoadId(nroad);

    // 如果设施id相等,清空场景轨迹

    // console.log('handleFac',val,nroad);
    // getRoadTrail(nroad);
    // getInfo(val, projectId);
  };
  // 搜索位置清空后得回最近一个设施或者选中后设施的中心点
  const handleCenter = () => {
    if (projectId) {
      getSCeneData(projectId, true);
    }
  };

  const handleScene = (sceneNum: string, facIdStr: string, roadid: string) => {
    // setSceneno(sceneNum);
    // console.log('handleScene666666666',sceneNum,facIdStr,facId,roadid,roadId)
    getSCeneMapData(sceneNum, facIdStr, '', 'scene');
    setFacId(facIdStr);
    setRoadId(roadid);
  };
  const handleSearch = async (value: string) => {
    let rec: any = [];
    try {
      const { status, data = [] } = await getProjectList({ name: value });
      if (status === 0) {
        data.forEach((it: any) => {
          rec.push({ label: it?.projectName, value: it.id, className: 'facClass' });
        });
      }
    } catch (error) {
      rec = [];
    }
    return Promise.resolve(rec);
  };

  const handleFocus = (e: any) => {
    if (selectRef?.current) {
      selectRef?.current.getOptions(e?.target?.value);
    }
  };

  const clearIntervalTime = () => {
    if (newInterval.current) {
      clearInterval(newInterval.current);
    }
    newInterval.current = 0;
  };
  const openTimer = () => {
    if (newInterval.current) {
      clearIntervalTime();
    }
    newInterval.current = setInterval(() => {
      setImgIndex((prevCount) => {
        if (prevCount + 1 === imgDataList?.length) {
          clearIntervalTime();
          setResetColorFlag(true);
          return 0;
        }
        return prevCount + 1;
      });
    }, 130);
  };
  const handleView = (val: string) => {
    if (!val) return;
    const flag = val === 'open' || val === 'restart';
    if (val === 'open' || val === 'quit') {
      setImgIndex(0);
      setLnglatArr(imgDataList);
      setIsView(flag);
    } else {
      /* eslint-disable */
      if (val === 'pause') {
        clearIntervalTime();
      } else {
        openTimer();
      }
    }
  };

  useEffect(() => {
    if (isView) {
      openTimer();
    } else {
      /* eslint-disable */
      if (newInterval.current) {
        clearIntervalTime();
      }
    }
  }, [isView]);

  // 地图输入提示
  const mapAutoComplete = (val: any) => {
    AMap.plugin(['AMap.AutoComplete'], () => {
      const auto = new AMap.AutoComplete({});
      auto.search(val, (status: any, result: any) => {
        if (status === 'complete') {
          setLocationOpts(result?.tips?.length ? result?.tips : []);
        }
      });
    });
  };
  const handleLocationInfo = (val: any, option: any) => {
    let newAccode = '';
    if (val) {
      newAccode = val.split('_')?.[1];
    }
    if (option?.children) {
      setSelectAddress({ name: option?.children, accode: newAccode || '' });
    } else {
      setSelectAddress({ name: undefined, accode: '' });
    }
  };
  const handleLocationInfoData = (value: string) => {
    mapAutoComplete(value);
  };
  const searchLocation = (val: any) => {
    if (val) handleLocationInfoData(val);
  };

  return (
    <div className={`${styles.inspectPanelClass} ${styles.mapContain}`}>
      <HeadTop
        onSelMap={() => {}}
        themeType={theme}
        headLogo={headLogo}
        propStyles={propStyles}
        logoDesc={logoDesc}
        controlsNum={0}
      >
        <div className={styles.headRightClass}>
          <span className={propStyles['multi-select-span']}>
            <DebounceSelect
              className="searchFacilityClass faciltySearch search-input"
              popupClassName="dropdownSelectClass"
              onRef={selectRef}
              showSearch
              allowClear
              // autoFocus
              onFocus={handleFocus}
              onClear={handleClear}
              showArrow={false}
              placeholder="请搜索排查项目"
              fetchOptions={handleSearch}
              onSelect={(newValue: any) => {
                setProjectId(newValue?.value);
                if (newValue?.value !== projectId) {
                  getSCeneData(newValue?.value);
                  // setSceneno(undefined);
                }
                // if (newValue && newValue?.value) {
                //   // getInfo('', newValue?.value);
                //   getImgListInfos(newValue?.value);
                // }
              }}
            />
            <span className={propStyles['query-button']}>
              <SearchOutlined />
            </span>
          </span>
          <span className={styles.topHeadSpan}>
            <Select
              placeholder="搜索位置"
              allowClear
              className="searchFacilityClass faciltySearch search-input"
              popupClassName="dropdownSelectClass"
              showSearch
              suffixIcon={
                <SearchOutlined
                  style={{ width: '14px', height: '14px' }}
                  className="input-search-inspect"
                />
              }
              onSearch={searchLocation}
              onChange={(value: any, options: any) => handleLocationInfo(value, options)}
              defaultActiveFirstOption={false}
              notFoundContent={
                <EmptyPage content={'暂无数据'} customEmptyChartClass={'selectEmpty'} />
              }
              filterOption={false}
            >
              {locationOpts?.length &&
                locationOpts?.map((item: any) => (
                  <Option
                    className="facClass"
                    key={`${item.id}_${item.adcode}`}
                    value={`${item.id}_${item.adcode}`}
                  >
                    {item.name}
                  </Option>
                ))}
            </Select>
          </span>
        </div>
      </HeadTop>
      <div className={styles.middleContainer}>
        <BoardLeft mapType={mapType} dataInfo={dataLeftInfo} />
        <div className={propStyles['button-left-class']} onClick={() => handleView('open')}>
          <span>浏览模式</span>
        </div>
        <BoardRight
          mapType={mapType}
          dataRightInfo={rightInfoData}
          treeData={sceneDatas}
          handleSceneType={handleSceneType}
          handleFac={handleFac}
          handleScene={handleScene}
          selectKeys={selectTreeData}
          expandDatas={expandDatas}
        />
        <EvaMap
          mapType={mapType}
          onRef={mapRef}
          handleCenter={handleCenter}
          placeInfo={selectAddress}
          trailData={railData}
          sceneTrailData={sceneTrailData}
          mapInfo={{
            districtSearch: '河北省',
            zoom: 10,
            center: [114.487854, 38.03504],
          }}
          mapData={mapData}
        />
      </div>
      <HeadBottom
        handleMapStyle={handleMapStyle}
        isFullScreen={true}
        changeRoadStatus={() => {}}
        roadStatus=""
        programName={'boshilin'}
        handleFullScreen={handleFullScreen}
        toggleTheme={(type: any) => setTheme(type)}
        themeType={theme}
        propStyles={propStyles}
        bottomInfo={{ bottomLogo, copyright, poweredBy }}
      >
        {/* <div
          className={`${baseStyles.detectSpanClass} ${baseStyles.buttonBgClass} ${
            detectionType === 'inspectionBoard' ? `${baseStyles.cuberbuttonClass}` : null
          }`}
          onClick={() => {
            handleDetetion('inspectionBoard');
          }}
        >
          <span className={baseStyles.txtDetectClass}>日常巡检</span>
        </div> */}
        <div
          className={`${baseStyles.detectSpanClass} ${
            detectionType === 'hiddenDangerBoard' ? `${baseStyles.cuberbuttonClass}` : null
          }`}
          onClick={() => {
            handleDetetion('hiddenDangerBoard');
          }}
        >
          <span className={baseStyles.txtDetectClass}>隐患看板</span>
        </div>
      </HeadBottom>
      {isView ? (
        //  <UserMessage.Provider value={{resetFlag:resetColorFlag,resetColor: () => handleResetColor()}}>
        <ViewIndex imgInd={imgIndex} imgInfo={imgDataList[imgIndex]} handleView={handleView} />
      ) : //  </UserMessage.Provider>
      null}
    </div>
  );
};

export default HiddenDangerBoard;
