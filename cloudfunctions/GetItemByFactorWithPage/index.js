// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const collectionName = event.collectionName
  const factor = event.factor
  const pageIndex = event.pageIndex
  const openid = wxContext.OPENID
  const isUseUserId = event.isUseUserId
  if(isUseUserId){
    factor.userId = openid
  }
  let itemCount = (pageIndex -1) * pageSize
  var itemData = await db.collection(collectionName)
    .where(factor)
    .skip(itemCount)
    .get()
    .then(res => {
      return res.data;
    });
   
  return itemData

}