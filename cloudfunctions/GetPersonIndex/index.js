// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
// 1. 获取数据库引用
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()
  var personResult = []
  var maxId = 0
  var sumCount = await db.collection('FamousPersonInUse')
    .count()
    .then(res => {
      return res.total;
    });
  var customSignleMax = 100  
 
  while(maxId<sumCount){
    var personArrItem = await db.collection('FamousPersonInUse')
      .field({
        PersonId: true,
        NamePinYin: true,
        PersonName: true,
        Id:true ,
      })    
      .skip(maxId)
      .limit(customSignleMax)
      .get()
      .then(res => {
        return res.data
      })
      for(var i=0;i<personArrItem.length;i++){
        personResult.push(personArrItem[i])
      }
      maxId += personArrItem.length 
  } 
  
  return personResult
 
}