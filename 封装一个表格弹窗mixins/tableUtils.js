/**
 * 列表勾选项参数生成函数
 * @param type {String} 可选，为radio时表示单选框，为checkbox时表示多选框
 * @param disabledKey {String} 可选，作为判断是否禁用勾选的键名
 * @return 列表勾选项参数
*/
export function rowSelectionUtil(type = 'checkbox', disabledKey) {
  return {
    type: type,
    selectedRowKeys: [],  // 所有页面的勾选项的rowkey数组
    selectedRows: [],     // 当前页面的勾选项数据
    selectedDatas: {},    // 所有页面的勾选项数据，以{pageNum:rows}键值对的方式存储的跨页多选的勾选项数据
    onChange: (selectedRowKeys, selectedRows) => {
      this.rowSelection.selectedRowKeys = selectedRowKeys;
      this.rowSelection.selectedRows = selectedRows;
      this.rowSelection.selectedDatas[this.pagination.current] = selectedRows;
    },
    getCheckboxProps: (record) => ({
      props: {
        disabled: !!record[disabledKey]
      }
    })
  };
}

/**
 * 分页器参数生成函数 - 无total和pageSize显示
 * @param  callback {Function} 必传，表示page发生变化时执行的回调函数
 * @return 分页器参数
*/
export function paginationWithNoTotalUtil(callback) {
  if (!(callback instanceof Function)) {
    throw new Error('paginationWithNoTotalUtil分页器参数生成函数要求必须提供page发生变化时执行的回调函数');
  }
  return {
    current: 1,
    pageSize: 10,
    total: 0,
    onChange: (current) => {
      this.pagination.current = current;
      callback();
    },
  };
}

/**
 * 分页器参数生成函数 - 带有total和pageSize显示
 * @param  callback {Function} 必传，表示page发生变化时执行的回调函数
 * @return
*/
export function paginationWithTotalUtil(callback) {
  if (!(callback instanceof Function)) {
    throw new Error('paginationWithTotalUtil分页器参数生成函数要求必须提供page发生变化时执行的回调函数');
  }
  return {
    current: 1,
    pageSize: 10,
    pageSizeOptions: ['10', '20', '30'],
    showSizeChanger: true,
    total: 0,
    showTotal: (total, range) => {
      return range[0] + '-' + range[1] + ' 共' + total + '条';
    },
    onChange: (current) => {
      this.pagination.current = current;
      callback();
    },
    onShowSizeChange: (current, pageSize) => {
      this.pagination.current = current;
      this.pagination.pageSize = pageSize;
      callback();
    }
  };
}

/**
 * 表格分页器参数生成函数
 * @param type {String} 必传
 * @param callback {Function} 必传
 * @return 生成一个表格分页器配置参数
*/
export function paginationUtil(type, callback) {
  if (!(['withNoTotal', 'withTotal'].includes(type))) {
    throw new Error('paginationUtil表格分页器参数生成函数的参数type未传或值不符合规范');
  }
  if (!(callback instanceof Function)) {
    throw new Error('paginationUtil分页器参数生成函数要求必须提供page发生变化时执行的回调函数');
  }
  return type == 'withNoTotal' ? paginationWithNoTotalUtil.call(this, callback) : paginationWithTotalUtil.call(this, callback);
}

/**
 * 过滤表格的跨页勾选项数据
 * @param  keys {Array} 必传， 跨页勾选项的rowkey数组
 * @param  datas {Object} 必传，以{pageNum:rows}键值对的方式存储的跨页多选的勾选项数据
 * @description 由于antd组件问题，勾选项数据并不与勾选keys保持一致，因此必须多进行一步过滤
 * @return
*/
export function filterSelectedDatas(keys, datas) {
  const rows = Object.values(datas).flat().filter((item) => keys.includes(item.id));
  return rows;
}