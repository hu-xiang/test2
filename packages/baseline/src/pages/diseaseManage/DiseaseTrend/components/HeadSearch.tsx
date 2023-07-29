import { useModel } from 'umi';
import { Select } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from '../styles.less';
import { getFacilitityList } from '../../../../services/commonApi';
import EmptyPage from '../../../../components/EmptyPage';

const { Option } = Select;

const RightSearch: React.FC = () => {
  const [facilitiesList, setFacilitiesList] = useState<any>([]);
  const { setFkId } = useModel<any>('trend');
  useEffect(() => {
    const getFacilitiesList = async () => {
      let rec: any = [];
      try {
        const { status, data = [] } = await getFacilitityList({ name: '' });
        if (status === 0) {
          data.forEach((it: any) => {
            rec.push({ label: it.facilitiesName, value: it.id });
          });
        }
        setFacilitiesList(rec);
      } catch (error) {
        rec = [];
      }
    };
    getFacilitiesList();
  }, []);
  const onSelChange = (sel: any, option: any) => {
    setFkId(option?.key.toString());
  };
  return (
    <div className={styles['head-right-box']}>
      <div className={styles['inp-box']}>
        <Select
          allowClear
          popupClassName="drop-trend-classs"
          placeholder="搜索道路"
          className="trend-select-search"
          style={{ marginRight: 0 }}
          notFoundContent={
            <EmptyPage
              content={'暂无数据'}
              customEmptyChartClass={styles['trend-select-empty']}
              isBlack={false}
            />
          }
          onChange={onSelChange}
        >
          {facilitiesList?.length > 0 &&
            facilitiesList.map((item: any) => (
              <Option className="trend-sel-class" key={item?.value} value={item?.value}>
                {item?.label}
              </Option>
            ))}
        </Select>
      </div>
    </div>
  );
};

export default RightSearch;
