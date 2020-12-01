// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'meitianmy-fp6n2'
})
// 1. 获取数据库引用
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const startNumber = 0
  const endNumber = 2000
  for (var x = startNumber ; x < endNumber; x = x + 1000) {
    var famousPersonInUserArray = await db.collection('FamousPersonInUse')
      .skip(x)
      .limit(1000)
      .get()
      .then(res => {
        return res.data;
      });

    let personIds = []
    for (var i = 0; i < famousPersonInUserArray.length; i++) {
      personIds.push(famousPersonInUserArray[i].PersonId)
    }
    console.log(personIds)
    let personItemArray = await db.collection('FamousPerson')
      .where({
        Id: _.in(personIds)
      })
      .field({
        Id: true
      })
      .get()
      .then(res => {
        return res.data;
      });
    let newPersonIds = []
    for (var i = 0; i < personItemArray.length; i++) {
      console.log(personItemArray[i].Id)
      newPersonIds.push(personItemArray[i].Id)
    }
    // if(personItemArray.length < senstenceArray.length){
    //   console.log("缩小了"+( senstenceArray.length-personItemArray.length)+"个数字")
    // }
    if (newPersonIds.length > 0) {
      for (var i = 0; i < newPersonIds.length; i++) {
        let personid = newPersonIds[i]
        let personInUseId = ""
        for (var j = 0; j < famousPersonInUserArray.length; j++) {
          if (personid == famousPersonInUserArray[j].PersonId) {
            personInUseId = famousPersonInUserArray[j]._id
            break
          }
        }
        let personItem = await db.collection('FamousPerson')
          .where({
            Id: personid
          })
          .get()
          .then(res => {
            return res.data;
          });
        if (personItem[0] != undefined) {
          let personIndexId = personItem[0]._id
          await db.collection('FamousPersonInUse')
            .doc(personInUseId)
            .update({
              data: {
                PersonId: personIndexId
              }
            })
            .then(res3 => {
              console.log(personItem[0].Name + "操作完成")
            });
        } else {
          console.log("跳过执行")
        }
      }
    } else {
      console.log(x)
    }

    
  }
  console.log("全部操作完成")
  return 1

}