// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios').default
const cheerio = require('cheerio')
const querystring = require('querystring')

const homeUrl = "https://jwxt.shmtu.edu.cn/shmtu/home!index.action"
const casUrl = "https://cas.shmtu.edu.cn"

cloud.init({
  env: "default-qqexg"
})

const db = cloud.database()
const users = db.collection("users")

async function loginHome(username, password, execution, cookie, captcha) {
  let response
  try {
    response = await axios({
      method: "post",
      // url: casUrl + casUrlSuffix,
      url: "https://cas.shmtu.edu.cn/cas/login?service=https%3A%2F%2Fjwxt.shmtu.edu.cn%2Fshmtu%2Fhome%21index.action",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "cookie": cookie
      },
      // maxRedirects: 0,
      // validateStatus: function (status) {
      //   return status >= 200 && status < 303; // default
      // },
      data: querystring.stringify({
        username: username,
        password: password,
        _eventId: "submit",
        execution: execution,
        geolocation: "",
        validateCode: captcha,
      }),
    })
  }
  catch (err) {
    return {
      err: "failed"
    }
  }

  let newCookie = ""
  let rawCookies = response.headers["set-cookie"]
  for (let rc of rawCookies) {
    let i = rc.indexOf(";")
    newCookie += rc.slice(0, i + 1)
  }

  // const index = response.headers["location"]
  // if (index === undefined) {
  //   return "failed"
  // }

  // response = await axios({
  //   url: index,
  //   headers: {
  //     cookie: cookie
  //   },
  // })

  const $ = cheerio.load(response.data)
  if ($('a[title="查看登录记录"]').attr("title") === undefined) {
    return {
      err: "failed"
    }
  }

  const name = $('.userName').text().split('(')[0]
  return {
    name: name,
    cookie: newCookie
  }
}

// async function storeInDB(name, username, password) {
//   const user = users.where({ username: username }).get().then(
//     res => {
//       if (res.data.length < 1) {
//         users.add({
//           data: {
//             name: name,
//             username: username,
//             password: password
//           }
//         })
//       }
//     }
//   )
// }

// 云函数入口函数
exports.main = async (event, context) => {
  // const result = await getExecution()
  // const execution = result.execution
  // const casUrlSuffix = result.casUrlSuffix

  // if (execution === undefined) {
  //   return {
  //     err: "Failed to grap lt and execution"
  //   }
  // }

  const res = await loginHome(
    event.username,
    event.password,
    event.execution,
    event.cookie,
    event.captcha
  )
  if (res["err"] === "failed") {
    return {
      err: "Failed to login"
    }
  }

  return {
    cookie: res.cookie,
    name: res.name
  }
}