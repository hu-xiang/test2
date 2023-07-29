import MapLeft from './components/mapLeft';
import MapRight from './components/mapRight';
import Map from './components/map';
import { getMapInfo } from './service';
import React, { useState } from 'react';
import styles from './styles.less';
// import { useIntl } from 'umi';
export default (): React.ReactElement => {
  const [mapData, setMapData] = useState([]);
  const [fkFacilitiesId, setFkFacilitiesId] = useState();
  // const [taskType, setTskType] = useState();
  const getInfo = async (param: any) => {
    const res = await getMapInfo(param);
    setFkFacilitiesId(param.fkFacilitiesId);
    setMapData(res.data);
  };

  return (
    <div className={styles.mapContain}>
      <MapLeft />
      <Map mapData={mapData} fkFacilitiesId={fkFacilitiesId} />
      <MapRight onSelMap={(param: any) => getInfo(param)} />
    </div>
  );
};
