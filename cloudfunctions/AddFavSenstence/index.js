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
  const openid = wxContext.OPENID
  const senstenceId = event.senstenceId
  return await db.collection("User")
  .where({
    userId: openid
  })
  .update({
    data: {
      favSenstenceList: _.addToSet(senstenceId)
    }
  })
  .then(res => {
    return 1;
  })
  .catch(res => {

    return 0
  });

}