// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios').default
const cheerio = require('cheerio')
const querystring = require('querystring')

const questionnairUrl = "https://jwxt.shmtu.edu.cn/shmtu/evaluateStd!loadQuestionnaire.action"
const answerUrl = "https://jwxt.shmtu.edu.cn/shmtu/evaluateStd!save.action"
const semesterID = "195"

cloud.init({
  env: "default-qqexg"
})

async function writeAnswersheet(teacherID, courseID, cookie) {
  let answerSheet = {
    "teacherId": teacherID,
    "content_1": "",
    "content_2": "",
    "semester.id": semesterID,
    "lesson.id": courseID,
    "toFavoriteLesson": "",
    "teacher.ids": teacherID,
  }

  let response = await axios({
    url: questionnairUrl,
    method: "post",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "cookie": cookie
    },
    data: querystring.stringify({
      "evaluateState": "evaluate",
      "evaluateId": courseID + "," + teacherID
    }),
  })

  const $ = cheerio.load(response.data)

  for (let part of [$("tr.griddata-odd"), $("tr.griddata-even")]) {
    part.each(function (i, e) {
      let qname, answer
      ({ qname, answer } = getAnswer(this))
      answerSheet[qname] = answer
    })
  }

  response = await axios({
    url: answerUrl,
    method: "post",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "cookie": cookie
    },
    data: querystring.stringify(answerSheet)
  })
}

function getAnswer(q) {
  const $ = cheerio.load(q)
  let qname = $("input[name]").attr("name")
  let choiceList = $("input[value]")

  let answer = 0
  choiceList.each(function (i, e) {
    let value = $(this).attr("value")
    if (value > answer) {
      answer = value
    }
  })

  return {
    qname: qname,
    answer: answer.toString()
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  while (true) {
    for (let record of event.records) {
      if (record.evaluated === false) {
        writeAnswersheet(record.teacherID, record.courseID, event.cookie)
      }
    }

    const result = await cloud.callFunction({
      name: "getEvaluationInfo",
      data: {
        cookie: event.cookie
      }
    })

    if (result.result["records"] === undefined) {
      continue
    }

    valid = true

    for (let record of result.result["records"]) {
      if (record.evaluated === false) {
        valid = false
      }
    }

    if (valid) {
      return {
        msg: "success",
        records: result.result["records"]
      }
    }

  }
}