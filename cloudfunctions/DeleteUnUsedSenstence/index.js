// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  let arr = await db.collection('FamousPerson')
    .limit(1000)
    .field({
      _id: true
    })
    .get()

  let _idArray = []
  for (var i = 0; i < arr.data.length; i++) {
    _idArray.push(arr.data[i]._id)
  }
  console.log("开始执行")

  await db.collection("SenstenceWd")
    .where({
      FamousPersonId: _.nin(_idArray)
    })
    .remove()


  console.log("删除完成")
  return 1
}