/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */

export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  const authObj = {};
  if (currentUser) {
    currentUser.elements?.forEach((item: API.CurrentUser) => {
      authObj[item.code] = true;
    });
  }
  return authObj;
}
