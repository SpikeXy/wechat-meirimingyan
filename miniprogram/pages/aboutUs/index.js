// pages/aboutUs/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAdmin: false,
    qrImageUrl: "",
    thanksContent : 
    "让我怎样感谢你\n\
    当我走向你的时候 \n\
    我原想收获一缕春风\n\
    你却给了我整个春天\n\
    让我怎样感谢你\n\
    当我走向你的时候\n\
    我原想捧起一簇浪花\n\
    你却给了我整个海洋\n\
    让我怎样感谢你\n\
    当我走向你的时候\n\
    我原想撷取一枚红叶\n\
    你却给了我整个枫林\n\
    让我怎样感谢你\n\
    当我走向你的时候\n\
    我原想亲吻一朵雪花\n\
    你却给了我银色的世界\n\
    "
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading()
    let _this = this
    wx.cloud.callFunction({
      name: 'GetItemByFactor',
      data: {
        collectionName: "User",
        isUseUserId: true,
        factor: {}
      }
    }).then((res) => {
      //显示用户页面
      if (res.result != null && res.result != undefined && res.result.length > 0) {
        var reEntity = res.result[0]
        if (reEntity.isAdmin) {
          _this.setData({
            isAdmin: true
          })
        } else {
          _this.setData({
            isAdmin: false
          })
        }
      } else {
        _this.setData({
          isAdmin: false
        })
      }
      if (!_this.data.isAdmin) {
        wx.cloud.callFunction({
          name: 'GetCollection',
          data: {
            collectionName: "GlobalData"
          }
        }).then(res3 => {
          let qrCodeUrl = res3.result[0].QrCode
          _this.setData({
            qrImageUrl: qrCodeUrl
          })
          wx.hideLoading()

        })
      } else {
        wx.hideLoading({
          success: (res) => {},
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onShareTimeline(){
    let shareItem = {}
    shareItem.title= this.data.thanksContent
    shareItem.query= '/pages/index/index'
    shareItem.imageUrl= 'cloud://meitianmy-fp6n2.6d65-meitianmy-fp6n2-1259291258/global-image/wechatQrCode/gh_a9918c5b1a76_258_1.png'
    return shareItem
  },
})