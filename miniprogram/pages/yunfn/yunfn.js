// pages/yunfn/yunfn.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sum:0,
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.cloud.callFunction({
      name:"getSum",
      data:{
        a: 20,
        b: 1090
      },
      success: (res) => {
        console.log(res)
        this.setData({
          sum: res.result
        })
      },
      fail: err =>{
        console.log(err)
      }
    })
  },

  getData(){
    wx.cloud.callFunction({
      name:"getData",
      success: (res) => {
        console.log(res)
        // this.setData({
        //   sum: res.result
        // })
      },
      fail: err =>{
        console.log(err)
      }
    })
  },
})