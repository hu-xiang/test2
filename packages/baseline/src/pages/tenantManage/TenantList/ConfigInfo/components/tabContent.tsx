import React, { useState, useEffect, useImperativeHandle } from 'react';
import styles from '../styles.less';
import { Select, message, InputNumber } from 'antd';
import ProTable from '@ant-design/pro-table';
import { useCommonScrollObj } from '../../../../../utils/tableScrollSet';
import { getSeverityList, severityUpdate } from '../../service';

export type Member = {};
type Iprops = {
  tenantId: any;
  onRef: any;
};

const typeOps = [
  { label: '水泥', value: '1' },
  { label: '沥青', value: '2' },
  { label: '综合安全事件', value: '3' },
];

const types = [
  { label: '长度', value: 0 },
  { label: '面积', value: 1 },
  { label: '跳车高度', value: 2 },
];

let selectedKey: any = { 1: [], 2: [], 3: [] }; // 某病害类别 选中的key
let selectedVal: any = { 1: [], 2: [], 3: [] }; // 某病害类别 选中的置信度的值
let isFirstMountType = {
  1: true,
  2: true,
  3: true,
};
const TabContent: React.FC<Iprops> = (props) => {
  const [DiseaseType, setDiseaseType] = useState(1);
  const [dataSource, setDataSource] = useState<any>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const scrollObj = useCommonScrollObj(40, '.auditTable', dataSource, {
    x: '100%',
    y: 'calc(100vh - 436px)',
  });

  const handleConfidenceLevelChange = (e: any, recode: any, key: string) => {
    const tableList = dataSource.slice();
    tableList.forEach((item: any) => {
      if (item.id === recode.id) {
        setDataSource([]);
        item[key] = e;
        if (key === 'mild') {
          if (item['moderate'] && e && !(e < item['moderate'])) {
            message.warning({
              content: `轻度必须小于中度`,
              key: `轻度必须小于中度`,
            });
            item['mild'] = null;
          }
        }

        if (key === 'moderate') {
          if (item['mild'] && e && !(e > item['mild'])) {
            message.warning({
              content: `中度必须大于轻度`,
              key: `中度必须大于轻度`,
            });
            item['moderate'] = null;
            item['severe'] = null;
          } else {
            item['severe'] = e;
          }
        }
        const resIndex = selectedVal[DiseaseType].findIndex((val: any) => val.id === item.id);
        if (resIndex === -1) {
          selectedVal[DiseaseType].push({
            dataStatus: item.dataStatus,
            id: item.id,
            mild: item.mild,
            moderate: item.moderate,
            referenceIndicators: item.referenceIndicators,
            severe: item.severe,
          });
        } else {
          selectedVal[DiseaseType][resIndex] = {
            dataStatus: item.dataStatus,
            id: item.id,
            mild: item.mild,
            moderate: item.moderate,
            referenceIndicators: item.referenceIndicators,
            severe: item.severe,
          };
        }

        const list: any = dataSource?.map((d: any) => {
          if (d?.id === recode.id) {
            return {
              ...d,
              mild: item.mild,
              moderate: item.moderate,
              referenceIndicators: item.referenceIndicators,
              severe: item.severe,
            };
          }
          return d;
        });
        setDataSource(list);
      }
    });
  };
  const columns: any = [
    {
      title: '序号',
      dataIndex: 'id2',
      key: 'id2',
      width: 50,
      render: (text: any, record: any, index: number) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: '识别类型',
      dataIndex: 'diseaseName',
      key: 'diseaseName',
      width: 80,
    },
    {
      title: '参照指标',
      dataIndex: 'referenceIndicators',
      key: 'referenceIndicators',
      width: 100,
      ellipsis: true,
      render: (text: any, recode: any) => {
        return (
          <Select
            placeholder="请选择参照指标"
            disabled={!selectedRowKeys?.filter((item: any) => item === recode?.id)?.length}
            style={{ width: '100px' }}
            defaultValue={recode.referenceIndicators}
            options={types}
            onChange={(e: any) => handleConfidenceLevelChange(e, recode, 'referenceIndicators')}
          ></Select>
        );
      },
    },
    {
      title: '轻度(<)',
      dataIndex: 'mild',
      key: 'mild',
      width: 100,
      ellipsis: true,
      render: (text: any, recode: any) => {
        return (
          // <Input
          //   disabled={!selectedRowKeys?.filter((item: any) => item === recode?.id)?.length}
          //   placeholder="轻度"
          //   value={recode.mild}
          //   onChange={(e: any) => handleConfidenceLevelChange(e.target.value, recode, 'mild')}
          // />
          <InputNumber
            placeholder="轻度"
            disabled={!selectedRowKeys?.filter((item: any) => item === recode?.id)?.length}
            style={{ width: '100%' }}
            min={0}
            precision={2}
            value={recode.mild || null}
            onChange={(e: any) => handleConfidenceLevelChange(e, recode, 'mild')}
          ></InputNumber>
        );
      },
    },
    {
      title: '中度(<)',
      dataIndex: 'moderate',
      key: 'moderate',
      width: 100,
      ellipsis: true,
      render: (text: any, recode: any) => {
        return (
          // <Input
          //   disabled={!selectedRowKeys?.filter((item: any) => item === recode?.id)?.length}
          //   placeholder="中度"
          //   value={recode.moderate}
          //   onChange={(e: any) => handleConfidenceLevelChange(e.target.value, recode, 'moderate')}
          // />
          <InputNumber
            placeholder="中度"
            disabled={!selectedRowKeys?.filter((item: any) => item === recode?.id)?.length}
            style={{ width: '100%' }}
            min={0}
            precision={2}
            value={recode.moderate || null}
            onChange={(e: any) => handleConfidenceLevelChange(e, recode, 'moderate')}
          ></InputNumber>
        );
      },
    },
    {
      title: '重度(≥)',
      dataIndex: 'moderate',
      key: 'moderate',
      width: 80,
    },
  ];

  const handleTypeChange = (val: any) => {
    setDiseaseType(val);
  };

  const handleDataSource = async () => {
    setDataSource([]);
    const params = {
      DiseaseType,
      tenantId: props.tenantId,
    };
    const res = await getSeverityList(params);
    if (res.status === 0) {
      const resData = res?.data || [];
      // 判断是否需要修改表格数据
      if (selectedVal[DiseaseType]?.length) {
        selectedVal[DiseaseType].forEach((item: any, i: number) => {
          if (resData.length) {
            resData.forEach((val: any) => {
              if (val.id === item.id) {
                val.mild = selectedVal[DiseaseType][i].mild;
                val.moderate = selectedVal[DiseaseType][i].moderate;
                val.referenceIndicators = selectedVal[DiseaseType][i].referenceIndicators;
                val.severe = selectedVal[DiseaseType][i].severe;
              }
            });
          }
        });
      }

      setDataSource(resData);
      if (isFirstMountType[DiseaseType]) {
        isFirstMountType[DiseaseType] = false;

        const selectedRowList = resData.filter((item: any) => item.dataStatus);
        const keysArr = selectedRowList.map((item: any) => item.id);
        setSelectedRowKeys(keysArr);
        selectedKey[DiseaseType] = keysArr;

        selectedVal[DiseaseType] = resData.map((val: any) => {
          return {
            dataStatus: val.dataStatus,
            id: val?.id,
            mild: val.mild,
            moderate: val.moderate,
            referenceIndicators: val.referenceIndicators,
            severe: val.severe,
          };
        });
      } else {
        setSelectedRowKeys(selectedKey[DiseaseType]);
      }

      // setSelectedRowKeys(selectedKey[DiseaseType]);
    }
  };
  const reset = () => {
    selectedKey = { 1: [], 2: [], 3: [] };
    selectedVal = { 1: [], 2: [], 3: [] };
    isFirstMountType = {
      1: true,
      2: true,
      3: true,
    };
  };
  useEffect(() => {
    handleDataSource();
  }, [DiseaseType]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  const handleSelectChange = (selectedRowKeysArr: any) => {
    setSelectedRowKeys(selectedRowKeysArr);
    selectedKey[DiseaseType] = selectedRowKeysArr;

    if (selectedRowKeysArr.length) {
      selectedRowKeysArr.forEach((rowId: any) => {
        selectedVal[DiseaseType].forEach((val: any) => {
          if (val.id === rowId) {
            val.dataStatus = 1;
          }
        });
        // const resIndex = selectedVal[DiseaseType].findIndex((val: any) => val.id === item);
        // if (resIndex === -1) {
        //   const target: any = dataSource.filter((data: any) => data.id === item);
        //   selectedVal[DiseaseType].push({
        //     dataStatus: target[0]?.dataStatus,
        //     id: target[0]?.id,
        //     mild: target[0]?.mild,
        //     moderate: target[0]?.moderate,
        //     referenceIndicators: target[0]?.referenceIndicators,
        //     severe: target[0]?.severe,
        //   });
        // }
      });
    }

    // 取消勾选的 dataStatus 设为0
    const cancelSelectedArr = dataSource.filter(
      (item: any) => !selectedRowKeysArr.includes(item.id),
    );
    selectedVal[DiseaseType].forEach((item: any) => {
      cancelSelectedArr.forEach((val: any) => {
        if (val.id === item.id) {
          item.dataStatus = 0;
        }
      });
    });

    const newDataSource = dataSource.slice();
    newDataSource.forEach((item: any) => {
      if (!selectedRowKeysArr.includes(item.id)) {
        item.dataStatus = 0;
      } else {
        item.dataStatus = 1;
      }
    });
    setDataSource(newDataSource);
  };

  // const handleFilterSelectedRow = () => {
  //   const selectedValKeys = Object.keys(selectedVal);
  //   const res: any = [];
  //   selectedValKeys.forEach((key: any) => {
  //     res.push(...selectedVal[key].filter((item: any) => selectedKey[key].includes(item.id)));
  //   });
  //   return res;
  // };
  const save = async () => {
    // 保存已勾选的数据
    // const list = handleFilterSelectedRow();
    const list = selectedVal[DiseaseType];
    if (!list?.length) {
      message.warning({
        content: `请选择至少一条数据后再保存`,
        key: `请选择至少一条数据后再保存`,
      });
      return;
    }
    // const arr: any = list?.filter((item: any) => !item?.mild || !item.moderate);
    // if (arr.length) {
    //   message.warning({
    //     content: `轻度和中度数据不能为空`,
    //     key: `轻度和中度数据不能为空`,
    //   });
    //   return;
    // }

    const res = await severityUpdate(list);
    if (res.status === 0) {
      message.success({
        content: `保存成功`,
        key: `保存成功`,
      });
      // reset();
      handleDataSource();
    }
  };
  const cancel = () => {
    reset();
    handleDataSource();
  };
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    save,
    cancel,
  }));
  return (
    <div id={styles.container}>
      <div className={styles.auditTypes}>
        <span className="label">配置类型：</span>
        <Select
          defaultValue={'1'}
          onChange={handleTypeChange}
          options={typeOps}
          placeholder="请选择配置类型："
          style={{ width: 456 }}
        ></Select>
      </div>
      <div className="auditTable">
        <ProTable<Member>
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          toolBarRender={false}
          scroll={scrollObj}
          search={false}
          tableAlertRender={false}
          rowKey={'id'}
          rowSelection={{ selectedRowKeys, onChange: handleSelectChange }}
        />
      </div>
    </div>
  );
};
export default TabContent;
