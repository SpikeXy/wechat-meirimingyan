// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
// 1. 获取数据库引用
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  // var usedIdArray = "[1,2,3,4]";
  var senstenceId = event.senstenceId.toString()
  // //openId 用户的唯一标识
  // var openid = wxContext.OPENID
  // // 这个小程序的id
  // var appid = wxContext.APPID
  // // 开发者的UUID
  // var unionid = wxContext.UNIONID

  var senstenceWdEntity = {}
  // 查询获得最终数据
  var singleSenstence =await db.collection('SenstenceWd')
  .where({
    Id: senstenceId
  })
  .field({
    Senstence: true,
    Source: true,
    FamousPersonId: true  
  })
  .get()
  .then(res=>{
    return res.data[0] ;
  });
  senstenceWdEntity = singleSenstence
  //获取Person的简单的信息
  var personNameItem =await db.collection('FamousPerson')
  .where({
    Id:singleSenstence.FamousPersonId.toString()
  })
  .field({
    Name:true
  })
  .get()
  .then(res=>{
    return res.data[0];
  });
  senstenceWdEntity.PersonName = personNameItem.Name

  return senstenceWdEntity;

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}