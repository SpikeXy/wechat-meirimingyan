// 云函数入口文件
const cloud = require('wx-server-sdk')


cloud.init({
  env: 'meitianmy-fp6n2'
})
// 1. 获取数据库引用
const db = cloud.database();
const _ = db.command

function GetRandomNumber(maxInt) {
  return Math.floor(Math.random() * maxInt);
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  var itemList = await db.collection('SenstenceCategory')
    .limit(1000)
    .field({
      _id: true,
      name:true
    })
    .get()
    .then(res => {
      return res.data;
    });

  for (var i = 0; i < itemList.length; i++) {
    let categoryId = itemList[i]._id
    let categoryName = itemList[i].name
    var sumCount = await db.collection('SenstenceWd')
    .where({
      CategoryId: categoryId
    })
    .count()
    .then(res => {
      return res.total;
    });
    var senstenceList =  []
    if(sumCount<20){
      senstenceList = await db.collection('SenstenceWd')
      .where({
        CategoryId: categoryId
      })
      .get()
      .then(res => {
        return res.data;
      });
    }else{  
      var tempNumber = GetRandomNumber(sumCount)
      senstenceList = await db.collection('SenstenceWd')
      .where({
        CategoryId: categoryId
      })
      .skip(tempNumber)
      .limit(20)
      .get()
      .then(res => {
        return res.data;
      });
    }


    var tempNumber = GetRandomNumber(sumCount)

    if (senstenceList != undefined && senstenceList.length > 0) {
      for(var j = 0 ; j < senstenceList.length;j++  ){
        let personId = senstenceList[j].FamousPersonId
        var personItem = await db.collection('FamousPerson')
        .doc(personId)
        .field({
          Name: true,
          Avatar:true

        })
        .get()
        .then(res => {
          return res.data;
        });
        senstenceList[j].FamousPersonId = personId
        senstenceList[j].FamousPersonName = personItem.Name
        senstenceList[j].FamousPersonAvatar = personItem.Avatar
      }

    }
    itemList[i].senstenceList = senstenceList
    itemList[i].name = categoryName
  }
  return itemList

}