//index.js
const app = getApp()

Page({
  data: {
    groupList: [],
    cardHeight: 300,
    navBarHeight: 60,
    currentId: "",
    editShow: false,
    editPopWidth: 200,
    editPopHeight: 100,
    editSenstence: "",
    editSource: "",
    editPersonName: "",
    addShow: false,
    addSenstence: "",
    addSource: "",
    addPersonName: "",
    enableFavBtn: true,
    pageIndex: 1,
    senstenceIdList: []
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
        let editButtonBarHeight = 55
        let newCarHieght = res.windowHeight - editButtonBarHeight - app.globalData.CustomBar
        let newPopHieght = res.windowHeight - res.statusBarHeight - app.globalData.CustomBar - 150
        let newPopWidth = res.windowWidth - 50
        that.setData({
          cardHeight: newCarHieght,
          editPopWidth: newPopWidth,
          editPopHeight: newPopHieght,
        })
      }
    })
  },
  initData() {
    let that = this
    wx.cloud.callFunction({
      name: 'GetFavSenstence',
      data: {
        pageIndex: this.data.pageIndex
      },
      success: res => {
        let tempIdList = that.data.senstenceIdList
        for (var i = 0; i < res.result.length; i++) {
          if (tempIdList.indexOf(res.result[i]._id) == -1) {
            tempIdList.push(res.result[i]._id)
          }
        }
        that.setData({
          senstenceIdList: tempIdList,
          groupList: res.result,
          currentId: res.result[0]._id,
          editSenstence: res.result[0].Senstence,
          editSource: res.result[0].Source,
          editPersonName: res.result[0].Name,
        })
      },
      fail: err => {}
    })
  },
  changeCurrentItem(e) {
    let _this = this
    let itemId =  e.detail.currentItemId
    let tempSenstenceIds = _this.data.senstenceIdList
    let enableFavBtnValue = false
    if (tempSenstenceIds.indexOf(itemId) > -1) {
      enableFavBtnValue = true
    }else{
      enableFavBtnValue = false
    }
    this.setData({
      enableFavBtn:enableFavBtnValue,
      currentId: itemId
    })
    let groupData = this.data.groupList
    let j = 0
    for (var i = 0; i < groupData.length; i++) {

      if (e.detail.currentItemId == groupData[i]._id) {
        j = i
        _this.setData({
          editSenstence: groupData[i].Senstence,
          editSource: groupData[i].Source,
          editPersonName: groupData[i].Name,
        })
      }
    }
    //这里需要判断一下 currentId 在 groupList中的位置，如果是倒数第二位置了，就重新对 groupList 进行组合
    //让swiper可以继续下拉
    if (j >= 1000) {
      this.initData()
    } else if (groupData.length < 20) {
      //不需要刷新，就一页
    } else if (j == (groupData.length - 2)) {
      wx.showLoading({})
      wx.cloud.callFunction({
        name: 'GetFavSenstence',
        data: {
          pageIndex: _this.pageIndex + 1
        },
        success: res => {
          let tempIdList = _this.data.senstenceIdList
          for (var i = 0; i < res.result.length; i++) {
            if (tempIdList.indexOf(res.result[i]._id) == -1) {
              tempIdList.push(res.result[i]._id)
            }
          }
          _this.setData({
            senstenceIdList :  tempIdList ,
            pageIndex: _this.pageIndex + 1,
            groupList: groupData.concat(res.result),
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
  checkPersonName() {
    //检查名字是否是集合中的名字

  },
  cancelFav() {
    wx.showLoading()
    let _this = this
    let senstenceid = this.data.currentId
    //取消收藏
    wx.cloud.callFunction({
      name: 'RemoveFavSenstence',
      data: {
        senstenceId: senstenceid
      }
    }).then(res => {
      let tempSenstenceIds = _this.data.senstenceIdList
      for (var i = 0; i < tempSenstenceIds.length; i++) {
        if (tempSenstenceIds[i] == senstenceid) {
          tempSenstenceIds.splice(i, 1)
          break
        }
      }
      //更改显示
      wx.hideLoading()
      _this.setData({
        senstenceIdList: tempSenstenceIds,
        enableFavBtn: false
      })
    })
  },
  addFav() {
    wx.showLoading()
    let _this = this
    let senstenceid = this.data.currentId
    //添加到收藏里面去
    wx.cloud.callFunction({
      name: 'AddFavSenstence',
      data: {
        senstenceId: senstenceid
      }
    }).then(res => {
      let tempSenstenceIds = _this.data.senstenceIdList
      if (tempSenstenceIds.indexOf(senstenceid) == -1) {
        tempSenstenceIds.push(senstenceid)
      }
      //更改显示
      wx.hideLoading()
      _this.setData({
        senstenceIdList :tempSenstenceIds,
        enableFavBtn: true
      })
    })
  }

})