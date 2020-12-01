const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    hidden: true,
    list: [],
    listCur: "",
    searchWord: "",
    originalList: [],
    isLogined: false
  },
  onLoad() {

    // this.checkUser()
    this.initData()

  },
  // checkUser() {
  //   var that = this
  //   //检查用户是否已经存在
  //   wx.cloud.callFunction({
  //     name: 'GetItemByFactor',
  //     data: {
  //       collectionName: "User",
  //       isUseUserId: true,
  //       factor: {

  //       }
  //     }
  //   }).then((res) => {
  //         //显示用户页面
  //         if (res.result != null && res.result != undefined && res.result.length > 0) {
  //           that.setData({
  //             isLogined: true,
  //           })
  //           //开始刷数据
  //           that.initData()
  //         } else {
  //           that.setData({
  //             isLogined: false
  //           })
  //           wx.switchTab({
  //             url: '/pages/user/index',
  //           })
  //         }

  //   })
  // },
  initData() {
    wx.showLoading()
    let _this = this
    wx.cloud.callFunction({
      name: 'GetPersonIndexes',
      data: {}
    }).then(res => {
      wx.hideLoading()
      //内部的结果
      if (res.result != "" && res.result != undefined && res.result != null) {
        _this.setData({
          originalList: res.result,
          list: res.result,
          listCur: res.result[0].key
        })
      } else {
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
  },
  onReady() {
    let that = this;
    wx.createSelectorQuery().select('.indexBar-box').boundingClientRect(function (res) {
      that.setData({
        boxTop: res.top
      })
    }).exec();
    wx.createSelectorQuery().select('.indexes').boundingClientRect(function (res) {
      that.setData({
        barTop: res.top
      })
    }).exec()
  },
  //获取文字信息
  getCur(e) {
    this.setData({
      hidden: false,
      listCur: this.data.list[e.target.id].key,
    })
  },

  setCur(e) {
    this.setData({
      hidden: true,
      listCur: this.data.listCur
    })
  },
  //滑动选择Item
  tMove(e) {
    let y = e.touches[0].clientY,
      offsettop = this.data.boxTop,
      that = this;
    //判断选择区域,只有在选择区才会生效
    if (y > offsettop) {
      let num = parseInt((y - offsettop) / 20);
      this.setData({
        listCur: that.data.list[num].key
      })
    };
  },

  //触发全部开始选择
  tStart() {
    this.setData({
      hidden: false
    })
  },

  //触发结束选择
  tEnd() {
    this.setData({
      hidden: true,
      listCurID: this.data.listCur
    })
  },
  indexSelect(e) {
    let that = this;
    let barHeight = this.data.barHeight;
    let list = this.data.list;
    let scrollY = Math.ceil(list.length * e.detail.y / barHeight);
    for (let i = 0; i < list.length; i++) {
      if (scrollY < i + 1) {
        that.setData({
          listCur: list[i].key,
          movableY: i * 20
        })
        return false
      }
    }
  },
  addFav(e) {
    let _this = this
    wx.showLoading()
    let personId = e.currentTarget.dataset.personid
    let key = e.currentTarget.dataset.key
    let sub = e.currentTarget.dataset.sub
    let tempList = this.data.list
    //添加到收藏里面去
    wx.cloud.callFunction({
      name: 'AddFavPersonId',
      data: {
        personId: personId
      }
    }).then(res => {
      wx.hideLoading()
      //更改显示
      for (var i = 0; i < tempList.length; i++) {
        if (tempList[i].key == key) {
          for (var j = 0; j < tempList[i].entityArray.length; j++) {
            if (sub == j) {
              tempList[i].entityArray[sub].Like = true
              _this.setData({
                list: tempList
              })
              break
            }
          }
        }
      }
    })
  },
  cancelFav(e) {
    let _this = this
    wx.showLoading()
    let personId = e.currentTarget.dataset.personid
    let key = e.currentTarget.dataset.key
    let sub = e.currentTarget.dataset.sub
    let tempList = this.data.list
    //添加到收藏里面去
    wx.cloud.callFunction({
      name: 'RemoveFavPersonId',
      data: {
        personId: personId
      }
    }).then(res => {
      wx.hideLoading()
      //更改显示
      for (var i = 0; i < tempList.length; i++) {
        if (tempList[i].key == key) {
          for (var j = 0; j < tempList[i].entityArray.length; j++) {
            if (sub == j) {
              tempList[i].entityArray[sub].Like = false
              _this.setData({
                list: tempList
              })
              break
            }
          }
        }
      }
    })
  },
  changeSearchWord(e) {
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        searchWord: e.detail.value,
      })
    } else {
      that.setData({
        searchWord: "",
      })
    }
  },
  searchPerson(e) {
    let _this = this
    let inputText = this.data.searchWord
    if (inputText == "" || inputText == null || inputText == undefined) {
      this.setData({
        list: this.data.originalList
      })
    } else {

      wx.showLoading()
      //在数组内进行正则匹配，更新list显示
      let tempList = this.data.originalList
      let searchList = []
      for (var i = 0; i < tempList.length; i++) {
        let itemTemp = {}

        let enArry = []
        for (var j = 0; j < tempList[i].entityArray.length; j++) {

          if (tempList[i].entityArray[j].Name.search(inputText) > -1) {
            enArry.push(tempList[i].entityArray[j])
          }
        }
        if (enArry.length > 0) {
          itemTemp.key = tempList[i].key
          itemTemp._id = tempList[i]._id
          itemTemp.entityArray = enArry
          searchList.push(itemTemp)
        }

      }
      if (searchList.length > 0) {
        this.setData({
          list: searchList,
          listCur: searchList[0].key
        })
      } else {
        this.setData({
          list: [],
          listCur: ""
        })
      }

      wx.hideLoading()
    }
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
          url: '/pages/indexes/index',
        })
      })
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权',
        showCancel: false,
        cancelColor: '#ccc',
        cancelText: '取消',
        confirmText: '确认',
        confirmColor: 'black',
        success: function (res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {}
        }
      });
    }
  },
});