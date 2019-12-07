// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios').default
const cheerio = require('cheerio')

const homeUrl = "https://cas.shmtu.edu.cn/cas/login?service=https%3A%2F%2Fjwxt.shmtu.edu.cn%2Fshmtu%2Fhome%21index.action"

cloud.init({
  env: "default-qqexg"
})

async function getExecution() {
  let cookie = ""
  let response = await axios({
    url: homeUrl,
    // maxRedirects: 0,
    // validateStatus: function (status) {
    //   return status >= 200 && status < 303; // default
    // },
  })
  // let rawCookies = response.headers["set-cookie"]
  // for (let rc of rawCookies) {
  //   let i = rc.indexOf(";")
  //   cookie += rc.slice(0, i + 1)
  // }

  // const location = response.headers["location"]

  // response = await axios({
  //   url: location
  // })

  const $ = cheerio.load(response.data)

  const execution = $('input[name="execution"]').attr("value")
  // const casUrlSuffix = response.request.path
  return {
    execution: execution,
    // casUrlSuffix: casUrlSuffix,
    // cookie: cookie
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const res = await getExecution()

  return {
    execution: res.execution,
    // casUrlSuffix: res.casUrlSuffix,
    // cookie: res.cookie
  }
}