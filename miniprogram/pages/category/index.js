const app = getApp()
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    load: true,
    topBarImages: [],
    categories: [],
    currentSenstenceId: "",
    editShow: false,
    editPopWidth: 200,
    editPopHeight: 100,
    editSenstence: "",
    editSource: "",
    editPersonName: "",
    editPersonAvatar: "",
    userlike: false
  },
  onLoad() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    let that = this
    this.initCategoryList()
    this.initTopBarImages()
    //获取屏幕的高度
    wx.getSystemInfo({
      success: function (res, rect) {
        let newPopHieght = res.windowHeight - res.statusBarHeight - app.globalData.CustomBar - 150
        let newPopWidth = res.windowWidth - 50
        that.setData({
          editPopWidth: newPopWidth,
          editPopHeight: newPopHieght,
        })
      }
    })
  },
  initCategoryList() {
    let _this = this

    wx.cloud.callFunction({
      name: 'GetCategoriesData',
      data: {}
    }).then(res => {
      let categories = [];
      for (let i = 0; i < res.result.length; i++) {
        categories[i] = res.result[i]
        categories[i].id = i;
      }
      _this.setData({
        categories: categories,
        categoriesCur: categories[0]
      })
    })
  },
  initTopBarImages() {
    let _this = this

    wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "GlobalData"
      }
    }).then(res => {
      let images = res.result[0].CategoryTopBarImages
      _this.setData({
        topBarImages: images
      })

    })
  },
  clickAvatar(e) {
    let personId = e.currentTarget.dataset.personid
    //进入名人的详情页
    wx.navigateTo({
      url: '/pages/personDetail/index?id=' + personId,
    })
  },
  clickSenstence(e) {
    wx.showLoading({
    })
    let _this = this
    //进入名言的详情页
    let sensetenceId = e.currentTarget.dataset.sensetenceid
    let FamousPersonName = e.currentTarget.dataset.famouspersonname
    let Senstence = e.currentTarget.dataset.senstence
    let FamousPersonAvatar = e.currentTarget.dataset.famouspersonavatar
    let like = false
    wx.cloud.callFunction({
      name: 'CheckFavSenstence',
      data: {
        senstenceId: sensetenceId
      }
    }).then(res => {
      if (parseInt(res.result) == 1) {
        like = true
      } else {
        like = false
      }
      wx.hideLoading({
      })
      _this.setData({
        userlike:like
      })
    })
    //检查此用户是否已经收藏了此名言
    let source = e.currentTarget.dataset.source
    this.setData({

      currentSenstenceId: sensetenceId,
      editShow: true,
      editSenstence: Senstence,
      editSource: source,
      editPersonName: FamousPersonName,
      editPersonAvatar: FamousPersonAvatar,
    })
  },
  closeEdit() {
    this.setData({
      editShow: false,
      currentSenstenceId: "",
      userlike: false,
      editSenstence: "",
      editSource: "",
      editPersonName: "",
      editPersonAvatar: "",
    })
  },
  onReady() {
    wx.hideLoading()
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      MainCur: e.currentTarget.dataset.id,
      VerticalNavTop: (e.currentTarget.dataset.id - 1) * 50
    })
  },
  VerticalMain(e) {
    let that = this;
    let categories = this.data.categories;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < categories.length; i++) {
        let view = wx.createSelectorQuery().select("#main-" + categories[i].id);
        view.fields({
          size: true
        }, data => {
          categories[i].top = tabHeight;
          tabHeight = tabHeight + data.height;
          categories[i].bottom = tabHeight;
        }).exec();
      }
      that.setData({
        load: false,
        categories: categories
      })
    }
    let scrollTop = e.detail.scrollTop + 20;
    for (let i = 0; i < categories.length; i++) {
      if (scrollTop > categories[i].top && scrollTop < categories[i].bottom) {
        that.setData({
          VerticalNavTop: (categories[i].id - 1) * 50,
          TabCur: categories[i].id
        })
        return false
      }
    }
  },
  cancelFav() {
    wx.showLoading()
    let _this = this
    let senstenceid = this.data.currentSenstenceId
    //取消收藏
    wx.cloud.callFunction({
      name: 'RemoveFavSenstence',
      data: {
        senstenceId: senstenceid
      }
    }).then(res => {
      //更改显示
      wx.hideLoading()
      _this.setData({
        userlike: false
      })
    })
  },
  addFav() {
    wx.showLoading()
    let _this = this
    let senstenceid = this.data.currentSenstenceId
    //添加到收藏里面去
    wx.cloud.callFunction({
      name: 'AddFavSenstence',
      data: {
        senstenceId: senstenceid
      }
    }).then(res => {
      //更改显示
      wx.hideLoading()
      _this.setData({
        userlike: true
      })
    })
  }
})