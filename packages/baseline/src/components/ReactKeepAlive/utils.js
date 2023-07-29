// tree扁平化
export function treeToList(tree, childrenKey = 'routes') {
  let arr = [];

  tree.forEach((item) => {
    if (item[childrenKey] && item[childrenKey].length > 0) {
      arr = [...arr, ...treeToList(item[childrenKey])];
    } else {
      arr.push(item);
    }
  });

  return arr;
}
