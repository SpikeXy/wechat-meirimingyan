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

  var famousPersonItem = await db.collection("User")
    .where({
      userId: openid
    })
    .field({
      favPersonList: true
    })
    .get()
    .then(res => {
      return res.data[0];
    });
    if(famousPersonItem==undefined || famousPersonItem == null){
      return ""
    }
  var famousPersonIds = famousPersonItem.favPersonList
  var resultData =
    resultData = (await db.collection("PersonIndexes")
      .aggregate()
      .limit(50)
      .sort({
        key: 1
      })
      .end()).list


  var finallyArray = []
  for (var i = 0; i < resultData.length; i++) {
    let demo = {}
    let entity = resultData[i]
    demo.key = entity.key
    demo._id = entity._id
    demo.entityArray = []
    for (var j = 0; j < entity.dict.length; j++) {
      let personId = entity.dict[j]._id
      if (famousPersonIds != undefined && famousPersonIds.length > 0) {
        if (famousPersonIds.indexOf(personId) > -1) {
          entity.dict[j].Like = true
        } else {
          entity.dict[j].Like = false
        }
      } else {
        entity.dict[j].Like = false
      }
      demo.entityArray.push(entity.dict[j])
    }
    finallyArray.push(demo)
  }
  return finallyArray

}