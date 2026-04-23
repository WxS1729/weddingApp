Page({
    data: {
        list: [],
        total: 0,
        totalNum: 0,
        loading: true
    },

    onLoad() {
        this.fetchData()
    },

    fetchData() {
        wx.cloud.callFunction({
            name: 'surveyList'
        }).then(({ result: { isAdmin, list, total } }) => {
            if (!isAdmin) {
                wx.showToast({ title: '无权限访问', icon: 'none' })
                setTimeout(() => wx.navigateBack(), 1500)
                return
            }
            const totalNum = list.reduce((sum, item) => sum + (item.num || 0), 0)
            this.setData({ list, total, totalNum, loading: false })
        }).catch(err => {
            console.error('获取数据失败', err)
            wx.showToast({ title: '加载失败', icon: 'none' })
        })
    }
})
