import { message } from 'antd';

export function getTokenName() {
  const locationName = window.location?.origin;
  return `token-${locationName}`;
}

export function serviceError(error: any) {
  message.error({
    content: error.message,
  });
}
