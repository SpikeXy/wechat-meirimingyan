//index.js
const app = getApp()

Page({
  data: {
    groupList: [],
    cardHeight: 300,
    navBarHeight: 60,
    currentId: "",
  },

  onLoad: function (options) {
    let that = this
    let senstenceId = options.id
    this.setData({
      currentId : senstenceId
    })
    wx.showShareMenu({
      withShareTicket: true
    })
    this.initData()
    //获取屏幕的高度
    wx.getSystemInfo({
      success: function (res, rect) {
        let carLineHeight = 52
        let newCarHieght = res.windowHeight - res.statusBarHeight - app.globalData.CustomBar - carLineHeight
        that.setData({
          cardHeight: newCarHieght,
          navBarHeight: app.globalData.CustomBar
        })
      }
    })
  },
  initData() {
    let that = this
    wx.cloud.callFunction({
      name: 'GetItemById',
      data: {
        collectionName: "SenstenceWd",
        id: this.data.currentId
      }
    }).then(res=>{
      let tempGroupData = []
      tempGroupData.push(res.result)
      let personId = res.result.FamousPersonId
      wx.cloud.callFunction({
        name: 'GetItemById',
        data: {
          collectionName: "FamousPerson",
          id: personId
        }
      }).then(resPerson=>{
        let personEntity = resPerson.result
        tempGroupData[0].Name = personEntity.Name
        tempGroupData[0].Avatar = personEntity.Avatar
        that.setData({
          groupList: tempGroupData,
        })
      })

    })
  },
  onAddToFavorites(e){
    //监听收藏动作
    let senstenceId = this.data.currentId
    let groupData = this.data.groupList
    let senstenceContent = ""
    let avatar = ""
    for (var i = 0; i < groupData.length; i++) {
      if (senstenceId == groupData[i]._id) {
        senstenceContent = groupData[i].Senstence
        avatar = groupData[i].Avatar
        break
      }
    }
    let shareItem = {}
    shareItem.title= senstenceContent
    shareItem.query= '/pages/senstenceDetail/index?id=' + senstenceId
    shareItem.imageUrl= avatar != undefined ? avatar: ""
    return shareItem
  },
  onShareAppMessage: function (res) {
    //监听分享动作
    if (res.from === 'button') {
      // 来自页面内转发按钮
      let senstenceId = this.data.currentId
      let groupData = this.data.groupList
      let senstenceContent = ""
      let avatar = ""
      for (var i = 0; i < groupData.length; i++) {
        if (senstenceId == groupData[i]._id) {
          senstenceContent = groupData[i].Senstence
          avatar = groupData[i].Avatar
          break
        }
      }
      let shareItem = {}
      shareItem.title= senstenceContent
      shareItem.path= '/pages/senstenceDetail/index?id=' + senstenceId
      shareItem.imageUrl= avatar != undefined ? avatar: ""
      return shareItem
    }else{
      return {}
    }
 
  },
  onShareTimeline(){
    let senstenceId = this.data.currentId
    let groupData = this.data.groupList
    let senstenceContent = ""
    let avatar = ""
    for (var i = 0; i < groupData.length; i++) {
      if (senstenceId == groupData[i]._id) {
        senstenceContent = groupData[i].Senstence
        avatar = groupData[i].Avatar
        break
      }
    }
    let shareItem = {}
    shareItem.title= senstenceContent
    shareItem.query= '/pages/senstenceDetail/index?id=' + senstenceId
    shareItem.imageUrl= avatar != undefined ? avatar: ""
    return shareItem
  },
  returnToIndex(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})