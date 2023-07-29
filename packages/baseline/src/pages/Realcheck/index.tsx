import React from 'react';
import { Row, Col, Tree, Button } from 'antd';
import styles from './styles.less';
import treeData from './treedata.json';
import Content from './component/Content';
import Mileage from './component/Mileage';
import Disasterdata from './component/Disasterdata';
import Kind from './component/Kind';
import Lineimg from './component/Lineimg';

export default (): React.ReactElement => {
  const { DirectoryTree } = Tree;
  return (
    <div id={styles.container}>
      <div className={styles.box}>
        <Button type="primary" className={styles.btn}>
          导出数据
        </Button>
      </div>
      <Row gutter={10} className="rowwidth">
        {/* 左侧路段路由 */}
        <Col span={4}>
          <DirectoryTree
            className={`${styles.bgwhite} ${styles.border} tree`}
            multiple
            icon={null}
            treeData={treeData}
            defaultExpandedKeys={['0-0-0', '0-0-1', '0-0-2', '0-0-3']}
          />
        </Col>
        {/* 中间部分 */}
        <Col span={13}>
          <Content />
        </Col>
        {/* 右边数据 */}
        <Col span={7}>
          <div>
            <Mileage />
            <Disasterdata />
            {/* 灾害种类统计 */}
            <Kind />
            {/* 道路历年PCI指数折线图 */}
            <Lineimg />
          </div>
        </Col>
      </Row>
    </div>
  );
};
