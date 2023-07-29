import React, { useState, useEffect, useImperativeHandle } from 'react';
import styles from '../styles.less';
import { Select, message, InputNumber } from 'antd';
import ProTable from '@ant-design/pro-table';
import { useCommonScrollObj } from '../../../../../utils/tableScrollSet';
import { getAuditList, updateAuditList } from '../../service';

export type Member = {};
type Iprops = {
  tenantId: any;
  onRef: any;
};

let selectedKey: any = { 1: [], 2: [], 3: [] }; // 某病害类别 选中的key
let selectedVal: any = { 1: [], 2: [], 3: [] }; // 某病害类别 选中的置信度的值
let isFirstMountType = {
  1: true,
  2: true,
  3: true,
};
const TetantUserList: React.FC<Iprops> = (props) => {
  const [DiseaseType, setDiseaseType] = useState(1);
  const [dataSource, setDataSource] = useState<any>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const scrollObj = useCommonScrollObj(40, '.auditTable', dataSource, {
    x: '100%',
    y: 'calc(100vh - 436px)',
  });

  const handleConfidenceLevelChange = (value: any, recode: any) => {
    const tableList = dataSource.slice();
    tableList.forEach((item: any) => {
      if (item.id === recode.id) {
        item.confidenceLevel = +value;
        const resIndex = selectedVal[DiseaseType].findIndex((val: any) => val.id === item.id);
        if (resIndex === -1) {
          selectedVal[DiseaseType].push({
            confidenceLevel: item.confidenceLevel,
            dataStatus: item.dataStatus,
            id: item.id,
          });
        } else {
          selectedVal[DiseaseType][resIndex] = {
            confidenceLevel: item.confidenceLevel,
            dataStatus: item.dataStatus,
            id: item.id,
          };
        }
      }
    });
  };
  const columns: any = [
    {
      title: '序号',
      dataIndex: 'id2',
      key: 'id2',
      width: 141,
      render: (text: any, record: any, index: number) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: '识别类型',
      dataIndex: 'diseaseName',
      key: 'diseaseName',
      width: 150,
    },
    {
      title: '置信度(≤)',
      dataIndex: 'confidenceLevel',
      key: 'confidenceLevel',
      width: 150,
      ellipsis: true,
      render: (text: any, recode: any) => {
        return (
          <InputNumber
            placeholder="置信度"
            min={0}
            max={1}
            precision={2}
            disabled={!recode.dataStatus}
            defaultValue={recode.confidenceLevel}
            onChange={(e: any) => handleConfidenceLevelChange(e, recode)}
          />
        );
      },
    },
  ];

  const handleTypeChange = (val: any) => {
    setDiseaseType(val);
  };
  const typeOps = [
    { label: '水泥', value: '1' },
    { label: '沥青', value: '2' },
    { label: '综合安全事件', value: '3' },
  ];

  const handleDataSource = async () => {
    setDataSource([]);
    const params = {
      DiseaseType,
      tenantId: props.tenantId,
    };
    const res = await getAuditList(params);
    if (res.status === 0) {
      const resData = res?.data || [];
      // 判断是否需要修改表格数据
      if (selectedVal[DiseaseType]?.length) {
        selectedVal[DiseaseType].forEach((item: any, i: number) => {
          if (resData.length) {
            resData.forEach((val: any) => {
              if (val.id === item.id) {
                val.confidenceLevel = selectedVal[DiseaseType][i].confidenceLevel;
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
            confidenceLevel: val?.confidenceLevel,
            dataStatus: val.dataStatus,
            id: val?.id,
          };
        });
      } else {
        setSelectedRowKeys(selectedKey[DiseaseType]);
      }
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

  const save = async () => {
    // 保存已勾选的数据
    const list = selectedVal[DiseaseType];
    if (!list?.length) {
      message.warning({
        content: `请选择至少一条数据后再保存`,
        key: `请选择至少一条数据后再保存`,
      });
      return;
    }
    const res = await updateAuditList(list);
    if (res.status === 0) {
      message.success({
        content: `保存成功`,
        key: `保存成功`,
      });
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
        <span className="label">审核类型：</span>
        <Select
          defaultValue={'1'}
          onChange={handleTypeChange}
          options={typeOps}
          placeholder="请选择审核类型"
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
export default TetantUserList;
