// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command


// 云函数入口函数
exports.main = async (event, context) => {
  const collectionName = event.collectionName
  var resultData = await db.collection(collectionName)
  .limit(1000)
  .get()
  .then(res => {
    return res.data;
  });
return resultData

}