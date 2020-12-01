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
  const _id = event._id
  const personid = event.personid

  var re = await db.collection("PersonIndexes")
    .doc(_id)
    .update({
      data:{
        dict:_.pull({
          _id : _.eq(personid)
        })
      }
    })
    .then(res => {

      return 1;
    })
    .catch(res => {

      return 0
    });
 
  return re
}
