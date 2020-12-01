//index.js
const app = getApp()

Page({
  data: {
    groupList: [],
    cardHeight: 300,
    navBarHeight: 60,
    currentId: "",
  },

  onLoad: function () {
    let that = this
    this.initData()
    wx.showShareMenu({
      withShareTicket: true
    })

    //获取屏幕的高度
    wx.getSystemInfo({
      success: function (res, rect) {
        let editButtonBarHeight = 35
        let newCarHieght = res.windowHeight - editButtonBarHeight 
        that.setData({
          cardHeight: newCarHieght,

        })
      }
    })
  },
  initData() {
    wx.showLoading({
    })
    let that = this
    wx.cloud.callFunction({
      name: 'GetFavPerson',
      data: {},
      success: res => {
        wx.hideLoading()
        that.setData({
          groupList: res.result,
          currentId: res.result[0]._id,
        })
      },
      fail: err => {}
    })
  },

  changeCurrentItem(e) {
    let _this = this
    this.setData({
      currentId: e.detail.currentItemId
    })
    let groupData = this.data.groupList
    let j = 0
    for (var i = 0; i < groupData.length; i++) {

      if (e.detail.currentItemId == groupData[i]._id) {
        j = i
      }
    }
    //这里需要判断一下 currentId 在 groupList中的位置，如果是倒数第二位置了，就重新对 groupList 进行组合
    //让swiper可以继续下拉
    if (j >= 1000) {
      this.initData()
    } else if (j == (groupData.length - 2)) {
      wx.showLoading()
      wx.cloud.callFunction({
        name: 'GetFavPerson',
        data: {},
        success: res => {
          for (var x = 0; x < res.result.length; x++) {
            groupData.push(res.result[x])
          }
          _this.setData({
            groupList: groupData,
          })
          wx.hideLoading({
            success: (res) => {},
          })
        },
        fail: err => {
          wx.hideLoading({
            success: (res) => {},
          })
        }
      })
    }
  },
})