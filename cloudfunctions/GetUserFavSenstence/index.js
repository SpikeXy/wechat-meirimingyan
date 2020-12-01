// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  var itemData = await db.collection("User")
    .where({
      userId : openid
    })
    .field({
      favSenstenceList:true
    })
    .get()
    .then(res => {
      return res.data[0];
    });
  return itemData

}