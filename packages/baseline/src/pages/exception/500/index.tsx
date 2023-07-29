import React from 'react';
import { Link } from 'umi';
import { Result, Button } from 'antd';

export default (): React.ReactNode => {
  return (
    <Result
      status="500"
      title="500"
      style={{
        background: 'none',
      }}
      subTitle="Sorry, the server is reporting an error."
      extra={
        <Link to="/">
          <Button type="primary">Back Home</Button>
        </Link>
      }
    />
  );
};
