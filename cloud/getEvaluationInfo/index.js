// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios').default
const cheerio = require('cheerio')
const querystring = require('querystring')

const evaluationUrl = "https://jwxt.shmtu.edu.cn/shmtu/evaluateStd!search.action"
const semesterID = "195"

cloud.init({
  env: "default-qqexg"
})

// 云函数入口函数
exports.main = async (event, context) => {
  const response = await axios({
    url: evaluationUrl,
    method: "post",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "cookie": event.cookie
    },
    data: querystring.stringify({
      "semester.id": semesterID
    }),
  })

  const $ = cheerio.load(response.data)
  let records = []

  for (let part of [$("tr.griddata-odd"), $("tr.griddata-even")]) {
    part.each(function (i, e) {
      let record = {}
      record["name"] = $(this).find("td:nth-child(4)").text()
      record["courseName"] = $(this).find("td:nth-child(2)").text()
      console.log($(this).find("td:nth-child(5)").text())
      if ($(this).find("td:nth-child(5)").text() !== "未评教") {
        record["evaluated"] = true
      } else {
        record["evaluated"] = false
        record["courseID"] = $(this).find("a[href]").attr("href").split("'")[3].split(",")[0]
        record["teacherID"] = $(this).find("a[href]").attr("href").split("'")[3].split(",")[1]
      }
      records.push(record)
    })
  }

  if (records.length === 0) {
    return {
      err: "Failed to gain records"
    }
  }

  return {
    records: records
  }
}