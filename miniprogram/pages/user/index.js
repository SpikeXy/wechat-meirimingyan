// miniprogram/pages/user/index.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tempId: "",
    isNeedLogin: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.checkUser()
  },
  goLogin(e) {
    wx.showLoading()
    //设置按钮禁止再点击
    this.setData({
      isClickGetUserInfo: true
    })
    // wx.showLoading({
    //   title: '等待..',
    // })

    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      const userInfoEntity = e.detail.userInfo
      //新增用户数据到集合
      wx.cloud.callFunction({
        name: 'AddItem',
        data: {
          isUseUserId: true,
          collectionName: "User",
          item: {
            nickName: userInfoEntity.nickName,
            gender: userInfoEntity.gender,
            country: userInfoEntity.country,
            language: userInfoEntity.language,
            province: userInfoEntity.province,
            avatarUrl: userInfoEntity.avatarUrl,
            //选择的主题
            themeSelected: 0,
            //喜爱的名言列表
            favSenstenceList: [],
            //喜爱的名人列表
            favPersonList: [],
          }
        }
      }).then(res3 => {
        wx.reLaunch({
          url: '/pages/user/index',
        })
      })
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权',
        showCancel: false,
        cancelColor:'#ccc',
        cancelText: '取消',
        confirmText:'确认',
        confirmColor:'black',
        success: function (res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
          }
        }
      });
    }
  },
  checkUser() {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    //检查用户是否已经存在
    wx.cloud.callFunction({
      name: 'GetItemByFactor',
      data: {
        collectionName: "User",
        isUseUserId: true,
        factor: {

        }
      }
    }).then((res) => {
      wx.hideLoading({
        success: (res2) => {
          //显示用户页面
          if (res.result != null && res.result != undefined && res.result.length > 0) {
            var reEntity = res.result[0]
            that.setData({
              tempId: reEntity._id,
              isNeedLogin: false,
              userName: reEntity.nickName,
              avatarUrl: reEntity.avatarUrl,
            })
          } else {
            that.setData({
              isNeedLogin: true
            })
          }

        },
      })

    })
  },
  getPhoneNumber: function (e) {
    wx.showLoading({
      title: '绑定中',
    })
    let tempId = this.data.tempId
    wx.cloud.callFunction({
      name: "GetPhoneNumber",
      data: {
        phoneData: wx.cloud.CloudID(e.detail.cloudID)
      }
    }).then(res => {
      let phoneData = res.result.data
      let updateEntity = {
        phoneNumber: phoneData.phoneNumber,
        countryCode: phoneData.countryCode,
      }
      wx.cloud.callFunction({
        name: "EditItem",
        data: {
          _id: tempId,
          collectionName: "User",
          item: updateEntity
        }
      }).then(res => {
        wx.showToast({
          title: '绑定成功',
          success: function () {
            wx.reLaunch({
              url: '/pages/user/index',
            })
          }
        })
      })
    }).catch(res=>{
      wx.hideLoading({
        success: (res) => {},
      })
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

  }
})