import { rowSelectionUtil, paginationUtil } from '@/utils/tableUtils.js';
export function tableModalMixins(params) {
  const { 
    /**
     * 必传，{Array} 提供设置或重置参数时的依据
     * 数组的第一项表示输入框动态绑定值的键，第二项表示网络请求参数的键
     * example：paramsArray = ['formParams','queryPramas'] 或 paramsArray = ['keyword','keywordPramas']
    */
    paramsArray = [],
    rowType = 'radio',  // 可选，为radio时表示单选框，为checkbox时表示多选框
    pageType = 'withNoTotal', // 可选，为withNoTotal表示分页器无total和pageSize显示，为withTotal表示分页器带有total和pageSize显示

  } = params

  const tableKeys = ['selectedRowKeys', 'selectedRows', 'selectedDatas']

  return {
    data() {
      return {
        visible: false,  // 为true时显示Modal模态框
        loading: false,  // 为true时表示表格请求数据ing..
        rowSelection: {}, // 列表勾选项
        pagination: {}, // 分页参数
        // 备份上一次勾选项，为了取消时重置
        previous: {
          selectedRowKeys: [],
          selectedRows: [],
          selectedDatas: {}
        },

      }
    },
    created() {
      this.rowSelection = rowSelectionUtil.call(this, rowType);
      this.pagination = paginationUtil.call(this, pageType, this.loadData)
    },
    methods: {
      /**
       * 过滤表格的当前页勾选项数据
       * @description 由于antd组件问题，勾选项数据并不与勾选keys保持一致，因此必须多进行一步过滤
      */
      filterSelectedRows() {
        const { selectedRowKeys, selectedRows } = this.rowSelection;
        const rows = selectedRows.filter((item) => selectedRowKeys.includes(item.id));
        return rows
      },

      /**
       * 过滤表格的跨页勾选项数据
       * @description 由于antd组件问题，勾选项数据并不与勾选keys保持一致，因此必须多进行一步过滤
      */
      filterSelectedDatas() {
        const { selectedRowKeys, selectedDatas } = this.rowSelection;
        const rows = Object.values(selectedDatas).flat().filter((item) => selectedRowKeys.includes(item.id));
        return rows
      },

      /**
       * 设置输入框参数或网络请求参数
       * @description 搜索时，设置网络请求参数为当前输入框值
       *              重置时，清空输入框参数和网络请求参数
       * （参数说明：inputKey为输入框动态绑定对象的键，queryKey为网络请求参数对象的键）
      */
      setParams(action) {
        const inputKey = paramsArray[0]
        const queryKey = paramsArray[1]

        if (!inputKey || !queryKey) {
          throw new Error('tableModalMixins需要提供由输入框参数和网络请求参数组成的数组')
        }

        if (action == 'search') {
          if (typeof this[inputKey] !== 'object') {
            this[queryKey] = this[inputKey]
          } else {
            Object.keys(this[inputKey]).forEach(key => {
              this[queryKey][key] = this[inputKey][key]
            })
          }
        }

        if (action == 'resetSearch') {
          if (typeof this[inputKey] !== 'object') {
            this[inputKey] = ''
            this[queryKey] = ''
          } else {
            Object.keys(this[inputKey]).forEach(key => {
              this[inputKey][key] = ''
              this[queryKey][key] = ''
            })
          }
        }
      },

      /**
       * 重置分页器参数
       * @description 搜索时，需重置页数
       *              重新打开Modal和重置搜索时，需重置页数和页码
      */
      setPagination(action) {
        this.pagination.current = 1;
        if (action == 'resetSearch') {
          this.pagination.pageSize = 10;
        }
      },

      /**
       * 重置、备份、取消勾选项
       * @description key为selectedRowKeys和selectedRows，重置为[]
       *              key为selectedDatas重置为{}
       *              
      */
      setSelection(action) {
        if (action == 'reset') {
          tableKeys.forEach(key => {
            if (key == 'selectedDatas') {
              this.rowSelection[key] = {}
              this.previous[key] = {}
            } else {
              this.rowSelection[key] = []
              this.previous[key] = []
            }
          })
        } else if (action == 'backup') {
          this.visible = false;
          tableKeys.forEach(key => {
            this.previous[key] = this.rowSelection[key]
          })
        } else if (action == 'cancel') {
          this.visible = false;
          tableKeys.forEach(key => {
            this.rowSelection[key] = this.previous[key]
          })
        } else {
          throw new Error('setSelection需要提供一种操作行为')
        }
      },

      /**
       * 打开弹窗Modal
      */
      openModal() {
        this.visible = true;
        this.resetSearch();
      },

      /**
       * 搜索
      */
      search() {
        this.setParams('search')
        this.setPagination();
        this.loadData();
      },

      /**
       * 重置
      */
      resetSearch() {
        this.setParams('resetSearch')
        this.setPagination('resetSearch');
        this.loadData();
      }
    }
  }
}