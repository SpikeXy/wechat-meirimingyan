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

function check_char(text) {
  var re = /[A-Za-z]+/;
  //返回true代表有英文
  var result = text.search(re);
  return result >= 0;
}


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const pastIds = []
  if(event.pastIds != undefined ){
    pastIds  =  event.pastIds.toString().split(',')
  }
  var count = await db.collection('SenstenceWd')
    .count()
    .then(res => {
      return res.total;
    });
  // 随机选择PersonId
  var countArr = [];
  while (countArr.length < 5) {

    var tempNumber = GetRandomNumber(count)
    if (countArr.indexOf(tempNumber) === -1 && pastIds.indexOf(tempNumber) === -1) {
      countArr.push(tempNumber);
    }
  }
  var senstenceArray = []
  for (var i = 0; i < countArr.length; i++) {
    var singleSenstenceTemp = await db.collection('SenstenceWd')
      .field({
        Id: true,
        Senstence: true,
        Source: true,
        FamousPersonId:true
      })
      .skip(countArr[i])
      .limit(1)
      .get()
      .then(res => {
        return res.data[0];
      });
      singleSenstenceTemp.randomId = countArr[i]
      senstenceArray.push(singleSenstenceTemp)
  }
  if(senstenceArray.length>0){
    for(var i = 0;i<senstenceArray.length;i++){
      let personId = senstenceArray[i].FamousPersonId
      await db.collection('FamousPerson')
      .doc(personId)
      .field({
        Name: true,
        Avatar: true,
      })
      .get()
      .then(res => {
        let result = res.data
        senstenceArray[i].Name = result.Name
        senstenceArray[i].Avatar = result.Avatar
      });
    }
  }
  return senstenceArray

}