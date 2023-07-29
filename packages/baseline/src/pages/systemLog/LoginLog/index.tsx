import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.less';
import { Button, Form, Row, Col, Badge } from 'antd';
import ProTable from '@ant-design/pro-table';
import ProForm, { ProFormText, ProFormDateTimeRangePicker } from '@ant-design/pro-form';
import { getListInfo } from './service';
import { useScrollQueObj } from '../../../utils/tableScrollSet';
import type { FormType } from './data';
import moment from 'moment';

// const { RangePicker } = DatePicker;
const SystemLog: React.FC = () => {
  const [formModel] = Form.useForm();
  const searchFormList: FormType = {
    location: '', // 关键字
    userName: '',
    startTime: undefined,
    endTime: undefined,
  };

  const [searchList, setSearchList] = useState<FormType>(searchFormList);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const [searchPage, setSearchPage] = useState(1);
  const [pickTime, setPickTime] = useState<any>({ startTime: undefined, endTime: undefined });

  const [tableData, setTableData] = useState<any>([]);
  const scrollObj = useScrollQueObj(tableData, { x: 1380, y: 'calc(100vh - 376px)' });
  const actionRef = useRef<any>();

  // 查询页面
  const queryPages = () => {
    setSearchPage(1);
    const formdata = formModel.getFieldsValue(true);
    const formData = {
      location: formdata?.location,
      userName: formdata?.userName,
      startTime: pickTime?.startTime,
      endTime: pickTime?.endTime,
      searPage: 1,
    };
    setSearchList({ ...formData });
    actionRef.current.reload();
  };
  // 重置
  const resetQueryPages = () => {
    formModel.setFieldsValue({ ...searchFormList, date: undefined });
    setSearchList({ ...searchFormList });
    setSearchPage(1);
  };

  const column: any = [
    {
      title: '序号',
      key: 'nums',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
      width: 80,
    },
    {
      title: '会话编号',
      dataIndex: 'tokenId',
      key: 'tokenId',
      width: 100,
      ellipsis: true,
    },
    {
      title: '用户名称',
      dataIndex: 'userName',
      key: 'userName',
      width: 100,
      ellipsis: true,
    },
    {
      title: '登录地址',
      dataIndex: 'ipaddr',
      key: 'ipaddr',
      width: 150,
      ellipsis: true,
    },
    {
      title: '登录地点',
      dataIndex: 'loginLocation',
      key: 'loginLocation',
      width: 100,
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      width: 100,
      ellipsis: true,
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
      width: 150,
      ellipsis: true,
    },
    {
      title: '登录状态',
      dataIndex: 'status',
      key: 'status',
      ellipsis: true,
      width: 150,
      render: () => {
        return <Badge color={'#54A325'} text={'成功'} />;
      },
    },
    {
      title: '登录日期',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 200,
    },
  ];

  const changetabval = (text: any) => {
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
      setTabpage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
    // setSelectedRowKey([]);
  };

  const onLoad = (dataSource: any) => {
    if (!dataSource?.length) {
      if (searchPage > 1) {
        setSearchPage(searchPage - 1);
      } else {
        setSearchPage(1);
      }
    }
    setTableData(dataSource);
  };

  const handleSubmit = () => {
    const formdata = formModel.getFieldsValue(true);
    let formData: FormType = {
      location: formdata?.location,
      userName: formdata?.userName,
    };
    if (formdata?.date && formdata?.date?.length && formdata?.date[0] && formdata?.date[1]) {
      formData = {
        ...formData,
        startTime: formdata?.date[0].format('YYYY-MM-DD HH:mm:ss'),
        endTime: formdata?.date[1].format('YYYY-MM-DD HH:mm:ss'),
      };
    }
    setSearchList({ ...formData });
  };
  useEffect(() => {
    const listener = (event: any) => {
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        event.preventDefault();
        handleSubmit();
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, []);
  const disabledDate = (current: any) => {
    return current && current > moment().endOf('day');
  };
  const timeRangeSelect = (dates: any, dateStrings: any) => {
    setPickTime({ startTime: dateStrings[0], endTime: dateStrings[1] });
  };

  return (
    <div className={`${styles.container} commonTableClass`}>
      <div className={` ${styles.topHead} topHead`}>
        <div className={styles.leftRow}>
          <ProForm // 配置按钮的属性
            form={formModel}
            isKeyPressSubmit={true}
            submitter={{
              // 配置按钮的属性
              resetButtonProps: {
                style: {
                  // 隐藏重置按钮
                  display: 'none',
                },
              },
              submitButtonProps: {
                style: {
                  // 隐藏重置按钮
                  display: 'none',
                },
              },
            }}
            layout="horizontal"
            className={styles.topFormClass}
          >
            <Row gutter={10} className={styles.firstRowClass}>
              <Col span={8}>
                <ProFormText name="location" label="登录地点" placeholder="请输入登录地点" />
              </Col>
              <Col span={8}>
                <ProFormText name="userName" label="用户名称" placeholder="请输入用户名称" />
              </Col>
              <Col span={8}>
                <ProFormDateTimeRangePicker
                  label="起止日期"
                  // width="md"
                  name="date"
                  fieldProps={{
                    disabledDate,
                    showTime: {
                      defaultValue: [
                        moment('00:00:00', 'HH:mm:ss'),
                        moment('23:59:59', 'HH:mm:ss'),
                      ],
                    },
                    onChange: timeRangeSelect,
                  }}
                  placeholder={['开始日期', '结束日期']}
                />
              </Col>
            </Row>
          </ProForm>
        </div>
        <div className={'buttonRowClass'}>
          <Button
            type="primary"
            onClick={() => {
              queryPages();
            }}
          >
            查询
          </Button>
          <Button
            onClick={() => {
              resetQueryPages();
            }}
          >
            清除
          </Button>
        </div>
      </div>
      <div className={`tabBoxCommon tabBoxButton`}>
        <ProTable<FormType>
          actionRef={actionRef}
          columns={column}
          request={async (params: any) => {
            const res = await getListInfo(params);
            return res;
          }}
          // onRequestError={reqErr}
          onLoad={onLoad}
          onChange={changetabval}
          params={searchList}
          pagination={{
            showQuickJumper: false,
            defaultPageSize: 20,
            current: searchPage,
            // onChange: pageChange,
          }}
          rowKey="tokenId"
          toolBarRender={false}
          search={false}
          scroll={scrollObj || { x: '100%' }}
          tableAlertRender={false}
        />
      </div>
    </div>
  );
};

export default SystemLog;
