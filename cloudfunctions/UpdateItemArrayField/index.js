// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'meitianmy-fp6n2'
})
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const collectionName = event.collectionName
  const _id = event._id
  const field = event.field
  const openid = wxContext.OPENID
  const operateFunction = event.operateFunction

  let itemData = ''
  if(operateFunction == 'pull'){
    itemData = await db.collection(collectionName)
    .where({
      userId: openid
    })
    .update({
      data:{
        field : _.pull(_id)
      }
    })
    .get()
    .then(res => {
      return res.data;
    });
   
  }else{
    itemData = await db.collection(collectionName)
    .where({
      userId: openid
    })
    .update({
      data:{
        field : _.addToSet(_id)
      }
    })
    .get()
    .then(res => {
      return res.data;
    });
   
  }

  return itemData

}