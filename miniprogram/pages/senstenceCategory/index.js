const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    categories: [],
    addCategoryShow:false,
    editCategoryShow:false,
    addCategoryName:"",
    addFileList: [],
    editFileList: [],
    addPopWidth: 200,
    addPopHeight: 100,
    editPopWidth: 200,
    editPopHeight: 100,
    tempId:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    this.initCategoryList()
    wx.getSystemInfo({
      success: function (res, rect) {
        let newPopHieght = res.windowHeight - res.statusBarHeight - app.globalData.CustomBar - 150
        let newPopWidth = res.windowWidth  - 50
        _this.setData({
          addPopWidth: newPopWidth,
          addPopHeight: newPopHieght,
          editPopWidth: newPopWidth,
          editPopHeight: newPopHieght,
        })
      }
    })
  },
  initCategoryList(){
    let _this = this
    wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "SenstenceCategory"
      }
    }).then(res => {
      _this.setData({
        categories:res.result
      })
    })
  },
  addCategory(){
    this.setData({
      addCategoryShow:true
    })
  },
  closeAddCategoryShow(){
    this.setData({
      addCategoryShow:false
    })
  },
  closeEditCategoryShow(){
    this.setData({
      editCategoryShow:false
    })
  },
  afterAddRead(event) {
    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    const path = file.path;
    const fileNameTemp = path.substr(String(path).lastIndexOf('/') + 1)
    const fileSuffix = fileNameTemp.substr(fileNameTemp.lastIndexOf('.'))
    const dateTimeFileName = "category-image/" + (new Date().getFullYear()) + (new Date().getMonth()) + (new Date().getDay()) + String(parseInt(Math.random() * 1000000000)) + fileSuffix
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
      _this.data.addFileList.push(imageFileTemp);
      // 上传完成需要更新 fileList
      _this.setData({
        addFileList: _this.data.addFileList
      });

    }).catch(error => {
      // handle error
    })
  },
  afterEditRead(event) {
    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    const path = file.path;
    const fileNameTemp = path.substr(String(path).lastIndexOf('/') + 1)
    const fileSuffix = fileNameTemp.substr(fileNameTemp.lastIndexOf('.'))
    const dateTimeFileName = "category-image/" + (new Date().getFullYear()) + (new Date().getMonth()) + (new Date().getDay()) + String(parseInt(Math.random() * 1000000000)) + fileSuffix

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
      _this.data.editFileList.push(imageFileTemp);
      // 上传完成需要更新 fileList
      _this.setData({
        editFileList: _this.data.editFileList
      });

    }).catch(error => {
      // handle error
    })
  },
  confirmAddCategory(){
    //新增类目
    let _this = this
    let categoryName = this.data.addCategoryName
    if(categoryName == '' && categoryName==undefined && categoryName == null){
      wx.showToast({
        title: '请填写类目名称',
        icon:'none'
      })
      return 
    }
    if(this.data.addFileList.length == 0){
      wx.showToast({
        title: '请上传图片',
        icon:'none'
      })
      return 
    }

    let categoryUrl = this.data.addFileList[0].url

    let itemData = {
      name: categoryName,
      image: categoryUrl,
    }
    wx.cloud.callFunction({
      name: 'AddItem',
      data: {
        collectionName: "SenstenceCategory",
        item: itemData
      }
    }).then(res=>{
      if(res.errMsg=="cloud.callFunction:ok"){
        wx.showToast({
          title: '完成',
          success:res=>{
            _this.initCategoryList()
            _this.setData({
              addCategoryShow:false
            })
          }
        })
 
      }else{
        wx.showToast({
          title: '服务器下班了',
        })
        _this.setData({
          addCategoryShow:false
        })
      }
    })
  },
  confirmEditCategory(){
    //新增类目
    let _this = this
    let _tempId = this.data.tempId
    let categoryName = this.data.editCategoryName
    if(categoryName == '' && categoryName==undefined && categoryName == null){
      wx.showToast({
        title: '请填写类目名称',
        icon:'none'
      })
      return 
    }
    if(this.data.editFileList.length == 0){
      wx.showToast({
        title: '请上传图片',
        icon:'none',
      })
      return 
    }
    let categoryUrl = this.data.editFileList[0].url
 
    let updateEntity = {
      name: categoryName,
      image: categoryUrl,
    }
    wx.cloud.callFunction({
      name: 'EditItem',
      data: {
        _id: _tempId,
        collectionName: "SenstenceCategory",
        item: updateEntity
      }
    }).then(res => {
      if(res.errMsg=="cloud.callFunction:ok"){
        wx.showToast({
          title: '完成',
          success:res=>{
            _this.initCategoryList()
            _this.setData({
              editCategoryShow:false
            })
          }
        })
 
      }else{
        wx.showToast({
          title: '服务器下班了',
        })
        _this.setData({
          editCategoryShow:false
        })
      }
    })
 
  },
  clickGridItem(e){
    let gridId = e.currentTarget.id 

    let tempList = this.data.categories
    let entity = {}
    for(var i = 0 ; i < tempList.length ; i++){
        if(tempList[i]._id == gridId){
          entity = tempList[i]
          break
        }
    }

    const path = entity.image;
    const fileNameTemp = path.substr(String(path).lastIndexOf('/') + 1)
    const fileSuffix = fileNameTemp.substr(fileNameTemp.lastIndexOf('.'))
    const dateTimeFileName = "category-image/" + (new Date().getFullYear()) + (new Date().getMonth()) + (new Date().getDay()) + String(parseInt(Math.random() * 1000000000)) + fileSuffix

    let editTempList = []
    var imageFileTemp = {}
    imageFileTemp.url = entity.image
    imageFileTemp.name = dateTimeFileName
    imageFileTemp.isImage = true
    imageFileTemp.deletable = true
    editTempList.push(imageFileTemp)

    this.setData({
      editCategoryShow : true,
      editCategoryName : entity.name,
      editFileList : editTempList,
      tempId : gridId
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  deleteAddCategory(){
    this.setData({
      addFileList : []
    })
  },
  deleteEditCategory(){
    this.setData({
      editFileList : []
    })
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