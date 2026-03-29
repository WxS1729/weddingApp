const db = wx.cloud.database();



Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // db.collection("user").get({
    //   success: function(res){
    //     console.log(res);
    //   }
    // });
  },

  clickOneData(){
    // db.collection("user").doc("f9fbf60c699976460148477978e3ce3f").get({
    //   success: function(res){
    //     console.log(res);
    //   }
    // });

    db.collection("user").doc("f9fbf60c699976460148477978e3ce3f").get().then(
      res => {
        console.log(res)
      }
    );

  },


  clickMoreData(){
    // db.collection("user").where({
    //   age: 20,
    //   username: "wxs"
    // }).get().then(
    //   res => {
    //     console.log(res)
    //   }
    // );

    db.collection("todos").where({
      // openid: "user-open-id",
      // progress: 20
      // "style.color":"yellow"
      style:{
        color: "yellow"
      }
    }).get().then(
      res => {
        console.log(res)
      }
    );
  },

  clickAllData(){
    db.collection("user").limit(10).get().then(
      res => {
        console.log(res);
        this.setData
        this.setData({
          list: res.data
        })
        console.log("this.listthis.listthis.list")
        console.log(this.data.list)
      }
    );
  },

  clickAddData(){
    db.collection("user").add({
      data:{
        username: "st",
        age: 25,
        jobs:["customer service","member"],
        image:"https://636c-cloud1-6gcoidmn8681ebe1-1405350599.tcb.qcloud.la/B17A9635_%E9%9A%97%E8%AE%B8%E8%88%9C%2C%E5%AE%8B%E9%9C%86(%E5%85%A5%E5%86%8C).jpg?sign=adcc8890d8b891810ca5ec2edd9c565c&t=1771673923"
      }
    }).then(
      res => {
        console.log(res)
      }
    );
  },

  clickDel(e){
    console.log(e.currentTarget.dataset.id)
    db.collection("user").doc(e.currentTarget.dataset.id).remove().then(
      res => {
      console.log(res)
      }
    )
  },
  
  clickUpdate(e){
    console.log(e.currentTarget.dataset.id)
    db.collection("user").doc(e.currentTarget.dataset.id).update({
      data:{
        username:"wxswxs"
      }
    }).then(
      res => {
      console.log(res)
      }
    )
  },

  clickCount(){
    db.collection("user").count().then(
      res => {
        console.log(res);
      }
    );
  }
})