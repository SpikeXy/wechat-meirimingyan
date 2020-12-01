//index.js
const app = getApp()

Page({
  data: {
    groupList: [],
    cardHeight: app.globalData.CarHieght,
    navBarHeight: app.globalData.CustomBar,
    currentId: "",
    currentSenstence: "",
    currentPersonName: "",
    currentSource: "",
    currentPersonAvatar: "",
    userLikedList: [],
    CustomBar: app.globalData.CustomBar,
    loadProgress: 0,
    isCanDraw: false,
    nickName: '',
    avatarUrl: '',
    showShare: false,
    shareBgImage: "",
    qrCodeImage: "",
    isLogined: false
  },

  onLoad: function () {
    let that = this
    wx.showShareMenu({
      withShareTicket: true
    })
    this.initData()
    wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "GlobalData"
      }
    }).then(res => {
      let imageUrl = res.result[0].ShareBgImage
      let qrCodeHttpUrl = res.result[0].QrCodeHttp
      that.setData({
        shareBgImage: imageUrl,
        qrCodeImage: qrCodeHttpUrl,
      })
    })
  },
  initData() {
    wx.showLoading({})
    let pastIds = ""
    let groupData = this.data.groupList
    let pastArr = []
    if (groupData.length > 0) {
      for (var i = 0; i < groupData.length; i++) {
        pastArr.push(groupData[i].randomId)
      }
      pastIds = pastArr.join(',')
    }
    this.setData({
      pastIds: pastIds
    })
    let that = this
    wx.cloud.callFunction({
      name: 'GetRandomSenstence',
      data: {},
      success: res => {
        let tempGroupData = res.result
        let favSenstenceIds = []
        console.log(tempGroupData)
        console.log(1)
        //检查用户是否已经存在
        wx.cloud.callFunction({
          name: 'GetItemByFactor',
          data: {
            collectionName: "User",
            isUseUserId: true,
            factor: {}
          }
        }).then((factorRes) => {
          console.log(2)
          //显示用户页面
          if (factorRes.result != null && factorRes.result != undefined && factorRes.result.length > 0) {
            console.log(3)
            //如果已经登录
            //获取用户收藏的语句列表的ID
            wx.cloud.callFunction({
              name: 'GetUserFavSenstence',
              data: {}
            }).then(userRes => {
              if (userRes.result != undefined || userRes.result != null) {
                let favSenstenceList = userRes.result.favSenstenceList
                if (favSenstenceList.lengt > 0) {
                  for (var i = 0; i < favSenstenceList.lengt; i++) {
                    favSenstenceIds.push(favSenstenceList[i])
                  }
                  for (var i = 0; i < tempGroupData.length; i++) {
                    if (favSenstenceIds.indexOf(tempGroupData[i]._id) > -1) {
                      tempGroupData[i].UserLike = true
                    } else {
                      tempGroupData[i].UserLike = false
                    }
                  }
                }
                wx.hideLoading({})
                that.setData({
                  isLogined: true,
                  groupList: tempGroupData,
                  currentId: tempGroupData[0]._id,
                  currentSenstence: tempGroupData[0].Senstence,
                  currentPersonName: tempGroupData[0].Name,
                  currentSource: tempGroupData[0].Source,
                  currentPersonAvatar: tempGroupData[0].Avatar,
                })
              }
            })
          } else {
            console.log(4)
            //如果没有登录
            wx.hideLoading({})
            that.setData({
              isLogined: false,
              groupList: tempGroupData,
              currentId: tempGroupData[0]._id,
              currentSenstence: tempGroupData[0].Senstence,
              currentPersonName: tempGroupData[0].Name,
              currentSource: tempGroupData[0].Source,
              currentPersonAvatar: tempGroupData[0].Avatar,
            })
          }
        })
      },
      fail: err => {}
    })
  },

  changeCurrentItem(e) {
    let _this = this
    let tempId = e.detail.currentItemId
    this.setData({
      currentId: tempId,
      showShare: false
    })
    let groupData = this.data.groupList
    let j = 0
    for (var i = 0; i < groupData.length; i++) {
      if (e.detail.currentItemId == groupData[i]._id) {
        j = i
        _this.setData({
          currentSenstence: groupData[i].Senstence,
          currentPersonName: groupData[i].Name,
          currentSource: groupData[i].Source,
          currentPersonAvatar: groupData[i].Avatar,
        })
        break
      }
    }
    //这里需要判断一下 currentId 在 groupList中的位置，如果是倒数第二位置了，就重新对 groupList 进行组合
    //让swiper可以继续下拉
    if (j >= 1000) {
      this.initData()
    } else if (j == (groupData.length - 4)) {
      this.loadProgress()
      wx.cloud.callFunction({
        name: 'GetRandomSenstence',
        data: {},
        success: res => {
          _this.setData({
            groupList: groupData.concat(res.result),
          })

        },
        fail: err => {

        }
      })
    }


  },
  loadProgress() {
    this.setData({
      loadProgress: this.data.loadProgress + 3
    })
    if (this.data.loadProgress < 100) {
      setTimeout(() => {
        this.loadProgress();
      }, 100)
    } else {
      this.setData({
        loadProgress: 0
      })
    }
  },
  clickAvatar(e) {
    let personId = e.currentTarget.dataset.personid
    //跳转到名人的详情页面
    wx.navigateTo({
      url: '/pages/personDetail/index?id=' + personId,
    })
  },
  addFav(e) {
    if (!this.data.isLogined) {
      this.switchToLoginPage()
      return
    }
    let _this = this
    wx.showLoading()
    let senstenceid = e.currentTarget.dataset.senstenceid
    let itemid = e.currentTarget.dataset.itemid
    let tempGroupList = this.data.groupList
    //添加到收藏里面去
    wx.cloud.callFunction({
      name: 'AddFavSenstence',
      data: {
        senstenceId: senstenceid
      }
    }).then(res => {
      wx.hideLoading()
      //更改显示
      for (var i = 0; i < tempGroupList.length; i++) {
        if (tempGroupList[i]._id == itemid) {
          tempGroupList[i].UserLike = true
          _this.setData({
            groupList: tempGroupList
          })
          break
        }
      }
    })
  },
  cancelFav(e) {
    if (!this.data.isLogined) {
      this.switchToLoginPage()
      return
    }
    let _this = this
    wx.showLoading()
    let senstenceid = e.currentTarget.dataset.senstenceid
    let itemid = e.currentTarget.dataset.itemid
    let tempGroupList = this.data.groupList
    //取消收藏
    wx.cloud.callFunction({
      name: 'RemoveFavSenstence',
      data: {
        senstenceId: senstenceid
      }
    }).then(res => {
      wx.hideLoading()
      //更改显示
      for (var i = 0; i < tempGroupList.length; i++) {
        if (tempGroupList[i]._id == itemid) {
          tempGroupList[i].UserLike = false
          _this.setData({
            groupList: tempGroupList
          })
          break
        }
      }
    })
  },
  onAddToFavorites(e) {
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
    shareItem.title = senstenceContent
    shareItem.query = '/pages/senstenceDetail/index?id=' + senstenceId
    shareItem.imageUrl = avatar != undefined ? avatar : ""
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
      shareItem.title = senstenceContent
      shareItem.path = '/pages/senstenceDetail/index?id=' + senstenceId
      shareItem.imageUrl = avatar != undefined ? avatar : ""
      return shareItem
    } else {
      return {}
    }

  },
  // onShareTimeline() {
  //   let senstenceId = this.data.currentId
  //   let groupData = this.data.groupList
  //   let senstenceContent = ""
  //   let avatar = ""
  //   for (var i = 0; i < groupData.length; i++) {
  //     if (senstenceId == groupData[i]._id) {
  //       senstenceContent = groupData[i].Senstence
  //       avatar = groupData[i].Avatar
  //       break
  //     }
  //   }
  //   let shareItem = {}
  //   shareItem.title = senstenceContent
  //   shareItem.query = '/pages/senstenceDetail/index?id=' + senstenceId
  //   shareItem.imageUrl = avatar != undefined ? avatar : ""
  //   return shareItem
  // },
  createShareImage() {
    this.setData({
      isCanDraw: false,
    })
  },
  getUserInfo(e) {
    wx.showLoading({})
    let _this = this
    this.setData({
      nickName: e.detail.userInfo.nickName,
      avatarUrl: e.detail.userInfo.avatarUrl,
    })

    wx.cloud.downloadFile({
      fileID: this.data.currentPersonAvatar
    }).then(fileRes => {
      // wx.setStorageSync('currentPersonAvatar', fileRes.tempFilePath)
      wx.hideLoading({})
      _this.setData({
        isCanDraw: true,
        showShare: true,
        currentPersonAvatar: fileRes.tempFilePath,

      })
    })

  },
  switchToLoginPage() {
    //跳转到登陆页面
    wx.showModal({
      title: "您还没有登录",
      content: "是否跳转到用登录页",
      cancelColor: '#ccc',
      cancelText: '取消',
      confirmText: '确认',
      confirmColor: 'black',
      success: res => {
        wx.switchTab({
          url: '/pages/user/index',
        })
      }
    })
  }
})