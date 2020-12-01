Component({
  properties: {
    //属性值可以在组件使用时指定
    isCanDraw: {
      type: Boolean,
      value: false,
      observer(newVal, oldVal) {
        newVal && this.drawPic()
      }
    },
    avatarUrl: {  
      type: String,
      value: "",
    },
    nickName: {  
      type: String,
      value: "",
    },
    currentPersonAvatar: {  
      type: String,
      value: "",
    },
    currentSenstence: {  
      type: String,
      value: "",
    },
    currentPersonName: {  
      type: String,
      value: "",
    },
    currentSource: {  
      type: String,
      value: "",
    },
    shareBgImage: {  
      type: String,
      value: "",
    },
    qrCodeImage: {  
      type: String,
      value: "",
    },
  },
  data: {
    isModal: false, //是否显示拒绝保存图片后的弹窗
    imgDraw: {}, //绘制图片的大对象
    sharePath: '', //生成的分享图
    visible: false
  },
  methods: {
    handlePhotoSaved() {
      this.savePhoto(this.data.sharePath)
    },
    handleClose() {
      this.setData({
        visible: false
      })
    },
    drawPic() {
      let _this = this
      // if (this.data.sharePath) { //如果已经绘制过了本地保存有图片不需要重新绘制
      //   this.setData({
      //     visible: true
      //   })
      //   this.triggerEvent('initData') 
      //   return
      // }
      // wx.showLoading({
      //   title: '生成中'
      // })
      wx.showLoading({
        title: _this.data.shareBgImage
      })
      this.setData({
        imgDraw: {
          width: '750rpx',
          height: '1334rpx',
          background: _this.data.shareBgImage,
          views: [
            {
              type: 'image',
              url: _this.data.avatarUrl,
              css: {
                top: '50rpx',
                left: '60rpx',
                width: '80rpx',
                height: '80rpx',
                borderWidth: '6rpx',
                borderColor: '#FFF',
                borderRadius: '96rpx'
              }
            },
            {
              type: 'text',
              text:  _this.data.nickName, 
              css: {
                top: '60rpx',
                fontSize: '35rpx',
                left: '215rpx',
                align: 'center',
                color: '#3c3c3c'
              }
            },
            {
              type: 'text',
              text: `与您分享精彩名言`,
              css: {
                top: '63rpx',
                left: '420rpx',
                align: 'center',
                fontSize: '35rpx',
                color: '#3c3c3c'
              }
            },
            {
              type: 'image',
              url:   _this.data.currentPersonAvatar, 
              css: {
                top: '194rpx',
                left: '328rpx',
                width: '120rpx',
                height: '120rpx',
                borderWidth: '6rpx',
                borderColor: '#FFF',
                borderRadius: '96rpx'
              }
            },
            {
              type: 'text',
              text:  _this.data.currentPersonName,  
              css: {
                top: '332rpx',
                fontSize: '28rpx',
                left: '385rpx',
                align: 'center',
                color: '#3c3c3c'
              }
            },
           
            {
              type: 'text',
              text:  _this.data.currentSenstence,  
              css: {
                top: '414rpx',
                left: '375rpx',
                maxLines: 6,
                width: '600rpx',
                align: 'center',
                fontWeight: 'bold',
                fontSize: '44rpx',
                color: '#3c3c3c'
              }
            },
            {
              type: 'text',
              text:_this.data.currentSource,  
              css: {
                top: '726rpx',
                right: '230rpx',
                align: 'center',
                width: "240px",
                fontSize: '45rpx',
                color: '#3c3c3c'
              }
            },
            {
              type: 'image',
              url: _this.data.qrCodeImage,  
              css: {
                top: '834rpx',
                left: '470rpx',
                width: '200rpx',
                height: '200rpx'
              }
            }
          ]
        }
      })
    },
    onImgErr(e) {
      wx.hideLoading()
      wx.showToast({
        title: '生成分享图失败，请刷新页面重试'
      })
    },
    onImgOK(e) {
      wx.hideLoading()
      this.setData({
        sharePath: e.detail.path,
        visible: true,
      })
      //通知外部绘制完成，重置isCanDraw为false
      this.triggerEvent('initData') 
    },
    preventDefault() { },
    // 保存图片
    savePhoto(path) {
      wx.showLoading({
        title: '正在保存...',
        mask: true
      })
      this.setData({
        isDrawImage: false
      })
      wx.saveImageToPhotosAlbum({
        filePath: path,
        success: (res) => {
          wx.showToast({
            title: '保存成功',
            icon: 'none'
          })
          setTimeout(() => {
            this.setData({
              visible: false
            })
          }, 300)
        },
        fail: (res) => {
          wx.getSetting({
            success: res => {
              let authSetting = res.authSetting
              if (!authSetting['scope.writePhotosAlbum']) {
                this.setData({
                  isModal: true
                })
              }
            }
          })
          setTimeout(() => {
            wx.hideLoading()
            this.setData({
              visible: false
            })
          }, 300)
        }
      })
    }
  }
})
