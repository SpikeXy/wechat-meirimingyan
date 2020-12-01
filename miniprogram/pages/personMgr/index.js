const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    hidden: true,
    list: [],
    originalList: [],
    listCur: "",
    editPopShow: false,
    avatarFileList: [],
    imageFileList: [],
    addPopWidth: 200,
    addPopHeight: 100,
    personName: "",
    tempId: "",
    tempParentId: "",
    tempAvatar: "",
    searchWord: "",
    personIndexesId: "",
    picker: [],
    pickerIndex: -1,
    editCategoryId: "",
    personCategories: [],
  },
  onLoad() {
    let _this = this
    this.initData()

    wx.getSystemInfo({
      success: function (res, rect) {
        let newPopHieght = res.windowHeight - res.statusBarHeight - app.globalData.CustomBar - 100
        let newPopWidth = res.windowWidth - 50
        _this.setData({
          addPopWidth: newPopWidth,
          addPopHeight: newPopHieght,
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
  initData() {
    let _this = this
    wx.showLoading()
    wx.cloud.callFunction({
      name: 'GetCollectionByLimit',
      data: {}
    }).then(res => {
      //内部的结果
      wx.hideLoading()
      _this.setData({
        originalList: res.result,
        list: res.result,
        listCur: res.result[0].key
      })
    })

    //获取分类数据
    wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "PersonCategory"
      }
    }).then(res3 => {
      let re = res3.result
      let reCategories = []
      for (var i = 0; i < re.length; i++) {
        reCategories.push(re[i].name)
      }
      _this.setData({

        personCategories: re,
        picker: reCategories
      })
    })
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
  editPop(e) {
    wx.showLoading()
    let _this = this
    let personIndexesIdTemp = e.currentTarget.dataset.personindexesid
    let name = e.currentTarget.dataset.name
    let categoryid = e.currentTarget.dataset.categoryid
    //判断category的pickerIndex的位置
    let personCategoryArray = this.data.personCategories
    let pickerIndexTemp = -1
    if(categoryid!="" && categoryid != undefined){
      for(var i= 0 ; i < personCategoryArray.length ; i++){
        if(personCategoryArray[i]._id  ==  categoryid ){
          pickerIndexTemp = i
        }
      }
    }
    this.setData({
      pickerIndex: pickerIndexTemp
    })

    let _id = e.currentTarget.dataset.id
    let parentId = e.currentTarget.dataset.parentid
    let avatar = e.currentTarget.dataset.avatar
    let avatarList = []
    if (avatar != "" && avatar != undefined && avatar != NaN) {
      const path = avatar;
      const fileNameTemp = path.substr(String(path).lastIndexOf('/') + 1)
      const fileSuffix = fileNameTemp.substr(fileNameTemp.lastIndexOf('.'))
      const dateTimeFileName = "category-image/" + (new Date().getFullYear()) + (new Date().getMonth()) + (new Date().getDay()) + String(parseInt(Math.random() * 1000000000)) + fileSuffix

      var imageFileTemp = {}
      imageFileTemp.url = avatar
      imageFileTemp.name = dateTimeFileName
      imageFileTemp.isImage = true
      imageFileTemp.deletable = true
      avatarList.push(imageFileTemp);
    }
    //开始想想名人的头像怎么处理？云函数的返回值应该需要修改

    //读取其他的图片
    wx.cloud.callFunction({
      name: 'GetItemById',
      data: {
        collectionName: "FamousPerson",
        id: _id
      }
    }).then(res => {
      wx.hideLoading({})
      _this.setData({
        imageFileList: res.result.Images == undefined ? [] : res.result.Images,
        tempId: _id,
        personIndexesId: personIndexesIdTemp,
        editPopShow: true,
        personName: name,
        avatarFileList: avatarList,
        tempParentId: parentId
      })
    })





  },
  closeEditPopShow() {
    this.setData({
      editPopShow: false,
      pickerIndex:-1
    })
  },
  deleteAvatar() {
    this.setData({
      avatarFileList: []
    })
  },
  afterRead(event) {
    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    const path = file.path;
    const fileNameTemp = path.substr(String(path).lastIndexOf('/') + 1)
    const fileSuffix = fileNameTemp.substr(fileNameTemp.lastIndexOf('.'))
    const dateTimeFileName = "avatar-image/" + (new Date().getFullYear()) + (new Date().getMonth()) + (new Date().getDay()) + String(parseInt(Math.random() * 1000000000)) + fileSuffix
    var _this = this
    wx.cloud.uploadFile({
      cloudPath: dateTimeFileName,
      filePath: file.path, // 文件路径
    }).then(res => {
      var imageFileTemp = {}
      imageFileTemp.url = res.fileID
      imageFileTemp.name = dateTimeFileName
      imageFileTemp.isImage = true
      imageFileTemp.deletable = true
      _this.data.avatarFileList.push(imageFileTemp);
      // 上传完成需要更新 fileList
      _this.setData({
        avatarFileList: _this.data.avatarFileList
      });

    }).catch(error => {
      // handle error
    })
  },
  deleteImage(e) {
    var fileId = e.detail.file.url
    //删除云存储中的文件
    wx.cloud.deleteFile({
      fileList: [fileId]
    })

    var index = e.detail.index
    //删除页面中的数据
    let fileArray = this.data.imageFileList
    fileArray.splice(index, 1)

    this.setData({
      imageFileList: fileArray
    })
  },
  afterImageRead(event) {
    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    const path = file.path;
    const fileNameTemp = path.substr(String(path).lastIndexOf('/') + 1)
    const fileSuffix = fileNameTemp.substr(fileNameTemp.lastIndexOf('.'))
    const dateTimeFileName = "avatar-image/" + (new Date().getFullYear()) + (new Date().getMonth()) + (new Date().getDay()) + String(parseInt(Math.random() * 1000000000)) + fileSuffix
    var _this = this
    wx.cloud.uploadFile({
      cloudPath: dateTimeFileName,
      filePath: file.path, // 文件路径
    }).then(res => {
      var imageFileTemp = {}
      imageFileTemp.url = res.fileID
      imageFileTemp.name = dateTimeFileName
      imageFileTemp.isImage = true
      imageFileTemp.deletable = true
      _this.data.imageFileList.push(imageFileTemp);
      // 上传完成需要更新 fileList
      _this.setData({
        imageFileList: _this.data.imageFileList
      });

    }).catch(error => {
      // handle error
    })
  },
  cancelPersonEdit() {
    this.setData({
      editPopShow: false
    })
  },
  //删除名人
  deletePerson() {
    let personIndexesIdTemp = this.data.personIndexesId
    let tempId = this.data.tempId
    let _this = this
    wx.showModal({
      title: "提示",
      content: "删除名人会附带删除所有此名人的言论，确认删除吗？",
      cancelColor: '#ccc',
      cancelText: '取消',
      confirmText: '确认',
      confirmColor: 'red',
      success: res => {
        if (res.confirm) {
          wx.showLoading({})
          wx.cloud.callFunction({
            name: "DeleteItemById",
            data: {
              collectionName: "FamousPerson",
              _id: tempId
            }
          }).then(res2 => {
            //删除所有此名人的言论
            wx.cloud.callFunction({
              name: 'DeleteItemByFactor',
              data: {
                collectionName: "SenstenceWd",
                isUseUserId: false,
                factor: {
                  FamousPersonId: tempId
                }
              }
            }).then(res3 => {
              //删除personIndex集合中的数据
              wx.cloud.callFunction({
                name: 'DeleteItemInPersonIndexes',
                data: {
                  personid: tempId,
                  _id: personIndexesIdTemp
                }
              }).then(res5 => {
                _this.setData({
                  editPopShow: false
                })
                wx.showToast({
                  title: '删除成功',
                  success: function () {
                    _this.initData()
                  }
                })
              })

            })

          })
        } else {}
      }
    })

  },
  //提交编辑名人
  confirmPersonEdit() {
    let parentId = this.data.tempParentId
    let personId = this.data.tempId
    let pickerIndex = this.data.pickerIndex
    let personNameTemp = this.data.personName
    let personCategoryIdTemp = ""
    let personCategories = this.data.personCategories
    for(var i = 0 ; i < personCategories.length ; i++){
      if( i == pickerIndex ){
        personCategoryIdTemp = personCategories[i]._id
      }
    }
    wx.showLoading({})
    let avatar = ""
    let _this = this
    if (this.data.avatarFileList == null || this.data.avatarFileList == undefined || this.data.avatarFileList == NaN || this.data.avatarFileList.length == 0) {

    } else {
      avatar = this.data.avatarFileList[0].url
    }

    //先修改FamousPerson集合中的数据
    let updateEntity = {
      Name: personNameTemp,
      Avatar: avatar,
      CategoryId: personCategoryIdTemp,
      Images: this.data.imageFileList
    }
    wx.cloud.callFunction({
      name: 'EditItem',
      data: {
        _id: this.data.tempId,
        collectionName: "FamousPerson",
        item: updateEntity
      }
    }).then(res => {

      if (res.errMsg == "cloud.callFunction:ok") {

        //再修改PersonIndexes中的数据
        //先查询到内存中的数组
        let tempGroupData = _this.data.list
        let tempEntityArray = []
        for (var j = 0; j < tempGroupData.length; j++) {
          if (parentId == tempGroupData[j]._id) {
            tempEntityArray = tempGroupData[j].entityArray
            break
          }
        }
        if (tempEntityArray.length > 0) {
          for (var j = 0; j < tempEntityArray.length; j++) {
            if (personId == tempEntityArray[j]._id) {
              tempEntityArray[j].Avatar = avatar
              tempEntityArray[j].Name = personNameTemp
              tempEntityArray[j].CategoryId = personCategoryIdTemp
            }
          }
        }
        let updatePersonIndexesEntity = {
          dict: tempEntityArray
        }
        wx.cloud.callFunction({
          name: 'EditItem',
          data: {
            _id: parentId,
            collectionName: "PersonIndexes",
            item: updatePersonIndexesEntity
          }
        }).then(finallyRes => {
          if (finallyRes.errMsg == "cloud.callFunction:ok") {
            wx.hideLoading()
            wx.showToast({
              title: '完成',
              success: res => {
                _this.initData()
                _this.setData({
                  editPopShow: false
                })
              }
            })
          } else {
            wx.showToast({
              title: '操作失败',
            })
          }
        })


      } else {
        wx.showToast({
          title: '服务器下班了',
        })
        _this.setData({
          editPopShow: false
        })
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
  pickerChange(e) {
    this.setData({
      pickerIndex: e.detail.value
    })
  }
});