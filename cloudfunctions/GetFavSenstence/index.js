// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'meitianmy-fp6n2'
})
// 1. 获取数据库引用
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  let pageIndex = 1 
  if(event.pageIndex !=undefined){
    pageIndex = parseInt(event.pageIndex)
  }
  const pageSize = 10
  let itemCount = pageSize * (pageIndex - 1)
  var userItem = await db.collection('User')
    .where({
      userId: openid
    })
    .field({
      favSenstenceList: true,
    })
    .get()
    .then(res => {
      return res.data[0];
    });
    var senstenceArray = []
  if (userItem != null && userItem != undefined) {
    let favSenstenceList = userItem.favSenstenceList
    let senstenceIdArray = []
    if (favSenstenceList!=undefined && favSenstenceList.length > 0) {
      if (favSenstenceList.length > itemCount) {
        //从itemCount位置开始计算20个返回
        let j = 0
        for (var i = itemCount; i < favSenstenceList.length; i++) {
          j++
          if (j == 20) {
            break
          } else {
            senstenceIdArray.push(favSenstenceList[i])
          }
        }

      }
    }
    if (senstenceIdArray.length == 0) {
      return ""
    }
  
    for(var i = 0 ; i < senstenceIdArray.length ; i++){
      let senstenceId = senstenceIdArray[i]
      let stempItem = await db.collection('SenstenceWd')
      .doc(senstenceId)
      .get()
      .then(res => {
        return res.data;
      });
      senstenceArray.push(stempItem)
    }

    let personIdArray = []
    for (var i = 0; i < senstenceArray.length; i++) {
      personIdArray.push(senstenceArray[i].FamousPersonId)
    }

    var personArray =  []
    for(var i = 0 ; i <personIdArray.length; i++ ){
      let fpItem = await db.collection('FamousPerson')
      .doc(personIdArray[i])
      .field({
        Name: true,
        Avatar: true,
        _id: true
      })
      .get()
      .then(res => {
        return res.data;
      });
      personArray.push(fpItem)
    }


    //组合数据
    for (var i = 0; i < senstenceArray.length; i++) {
      let personId = senstenceArray[i].FamousPersonId
      for (var j = 0; j < personArray.length; j++) {
        if (personArray[j]._id == personId) {
          senstenceArray[i].Name = personArray[j].Name
          senstenceArray[i].Avatar = personArray[j].Avatar
        }
      }
    }
    
  } 
  return senstenceArray
}