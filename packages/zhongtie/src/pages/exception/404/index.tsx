import React from 'react';
import { Link } from 'umi';
import { Result, Button } from 'antd';

export default (): React.ReactNode => {
  return (
    <Result
      status="404"
      title="404"
      style={{
        background: 'none',
      }}
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Link to="/">
          <Button type="primary">Back Home</Button>
        </Link>
      }
    />
  );
};
