// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  let arr = await db.collection('FamousPersonInUse')
    .limit(1000)
    .field({
      PersonName: true
    })
    .get()

  let nameArr = []
  console.log(arr)
  for (var i = 0; i < arr.data.length; i++) {
    nameArr.push(arr.data[i].PersonName)
  }
  // console.log(nameArr)
  console.log("开始执行")

  await db.collection("FamousPerson")
    .where({
      Name: _.nin(nameArr)
    })
    .remove()


  console.log("删除完成")
  return 1
}