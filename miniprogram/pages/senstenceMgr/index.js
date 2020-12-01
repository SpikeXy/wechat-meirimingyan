//index.js
const app = getApp()

Page({
  data: {
    senstenceCategories: [],
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
    picker: [],
    pickerIndex: -1,
    editCategoryId: "",
    CustomBar: app.globalData.CustomBar,
    loadProgress:0

  },

  onLoad: function () {
    let that = this
    this.initData()
    wx.showShareMenu({
      withShareTicket: true
    })
    this.initCategoryData()
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
    let tempCategoryId = ""
    wx.cloud.callFunction({
      name: 'GetRandomSenstence',
      data: {},
      success: res => {
        // if (res.result != undefined && res.result.length > 0) {
        //   tempCategoryId = res.result[0].CategoryId
        // }
  
        that.setData({
          groupList: res.result,
          currentId: res.result[0]._id,
          editSenstence: res.result[0].Senstence,
          editSource: res.result[0].Source,
          editCategoryId: tempCategoryId,
          editPersonName: res.result[0].Name,
        })

      },
      fail: err => {}
    })
  },
  initCategoryData() {
    let that = this
    //获取分类数据
    wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "SenstenceCategory"
      }
    }).then(res3 => {
      let re = res3.result
      // let tempIndex = -1
      let reCategories = []
      for (var i = 0; i < re.length; i++) {
        // reObj.value = re[i]._id
        // reObj.text = re[i].name
        // reObj.icon = re[i].image
        // if (re[i]._id == tempCategoryId) {
        //   tempIndex = i
        // }
        reCategories.push(re[i].name)
      }
      that.setData({
        // pickerIndex: tempIndex,
        senstenceCategories: re,
        picker: reCategories
      })

    })
  },
  editItem() {
    this.setData({
      editShow: true
    })
  },
  closeEdit() {
    this.setData({
      editShow: false
    })
  },
  closeAdd() {
    this.setData({
      addShow: false
    })
  },
  confirmEdit() {
    wx.showLoading()
    //确认编辑
    let senstenceWdId = this.data.currentId
    let pickerIndexTemp = this.data.pickerIndex
    let _this = this
    let editSourceTemp = this.data.editSource
    let editSenstenceTemp = this.data.editSenstence
    let senstenceCategoriesTemp = this.data.senstenceCategories
    let categoryId = ""
    let senstenceGroupList = this.data.groupList
    for (var i = 0; i < senstenceCategoriesTemp.length; i++) {
      if (i == pickerIndexTemp) {
        categoryId = senstenceCategoriesTemp[i]._id
        break
      }
    }

    let updatePersonIndexesEntity = {
      CategoryId: categoryId,
      Source: editSourceTemp,
      Senstence: editSenstenceTemp
    }
    wx.cloud.callFunction({
      name: 'EditItem',
      data: {
        _id: senstenceWdId,
        collectionName: "SenstenceWd",
        item: updatePersonIndexesEntity
      }
    }).then(res => {
      wx.showToast({
        title: '成功',
        duration: 1500,
        success: () => {
          wx.hideLoading()
 
          for(var i = 0 ; i < senstenceGroupList.length ; i++){
            if(  senstenceWdId == senstenceGroupList[i]._id){
              senstenceGroupList[i].Senstence = editSenstenceTemp
              senstenceGroupList[i].Source = editSourceTemp
              break
            }
          }
          _this.setData({
            groupList: senstenceGroupList,
            editSenstence :editSenstenceTemp,
            editSource:editSourceTemp,
            editShow: false
          })
        }
      })
    })
  },
  confirmAdd() {
    wx.showLoading()
    //确认编辑
    let _this = this
    let name = this.data.addPersonName
    //检查personName获取personId

    wx.cloud.callFunction({
      name: 'GetItemByFactor',
      data: {
        collectionName: "FamousPerson",
        factor: {
          Name: name
        }
      }
    }).then(res => {
      if (res.result.length == 0) {
        wx.showToast({
          title: '数据库中无此名人,请检查名人名字输入',
          icon: 'none',
          duration: 1500,
          success: function () {
            wx.hideLoading()
          }
        })

      } else {
        let personEntity = res.result[0]
        let personId = personEntity._id
        let pickerIndexTemp = this.data.pickerIndex
        let editSourceTemp = this.data.editSource
        let editSenstenceTemp = this.data.editSenstence
        let senstenceCategoriesTemp = this.data.senstenceCategories
        let categoryId = ""
        for (var i = 0; i < senstenceCategoriesTemp.length; i++) {
          if (i == pickerIndexTemp) {
            categoryId = senstenceCategoriesTemp[i]._id
            break
          }
        }
        let addPersonIndexesEntity = {
          CategoryId: categoryId,
          Source: editSourceTemp,
          FamousPersonId: personId,
          Senstence: editSenstenceTemp
        }
        wx.cloud.callFunction({
          name: 'AddItem',
          data: {
            collectionName: "SenstenceWd",
            item: addPersonIndexesEntity
          }
        }).then(res => {
          wx.showToast({
            title: '成功',
            duration: 1500,
            success: () => {
              wx.hideLoading()
              _this.setData({
                addShow: false
              })
            }
          })
        })
      }
    })

  },
  addItem() {
    //这里需要重新做一个弹出层
    this.setData({
      pickerIndex: -1,
      addShow: true
    })
  },
  deleteItem() {
    //删除名言
    let tempId = this.data.currentId
    let _this = this
    //询问是否真正删除
    wx.showModal({
      title: "提示",
      content: "请确认是否删除此项",
      cancelColor: '#ccc',
      cancelText: '取消',
      confirmText: '确认',
      confirmColor: 'red',
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "DeleteItemById",
            data: {
              collectionName: "SenstenceWd",
              _id: tempId
            }
          }).then(res2 => {
            wx.showToast({
              title: '删除成功',
              success: function () {
                _this.initData()
                // wx.reLaunch({
                //   url: '/pages/senstenceMgr/index',
                // })
              }
            })
          })
        } else {}
      }

    })
  },
  changeCurrentItem(e) {
    let _this = this
    let tempCurrentItemId = e.detail.currentItemId
    this.setData({
      currentId: tempCurrentItemId
    })
    let groupData = this.data.groupList
    let tempIndex = 0
    let re = this.data.senstenceCategories
    for (var i = 0; i < re.length; i++) {
      if (re[i]._id == tempCurrentItemId) {
        tempIndex = i
        break
      }
    }
    this.setData({
      pickerIndex: tempIndex,
    })
    let j = 0
    for (var i = 0; i < groupData.length; i++) {

      if (tempCurrentItemId == groupData[i]._id) {
        j = i
        _this.setData({
          editCategoryId: groupData[i].CategoryId,
          editSenstence: groupData[i].Senstence,
          editSource: groupData[i].Source,
          editPersonName: groupData[i].Name,
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
          for (var x = 0; x < res.result.length; x++) {
            groupData.push(res.result[x])
          }
          _this.setData({
            groupList: groupData,
          })
       
        },
        fail: err => {
  
        }
      })
    }


  },
  loadProgress(){
    this.setData({
      loadProgress: this.data.loadProgress+3
    })
    if (this.data.loadProgress<100){
      setTimeout(() => {
        this.loadProgress();
      }, 100)
    }else{
      this.setData({
        loadProgress: 0
      })
    }
  },
  pickerChange(e) {
    this.setData({
      pickerIndex: e.detail.value
    })
  }
})