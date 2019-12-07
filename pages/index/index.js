Page({
  data: {
    cellClass: "weui-cell",
    labelClass: "weui-label",
    wrongInfo: false,
    showDialog: false,
    hasResponsed: false,
    cookie: "",
    execution: "",
    captchaPath: "",
    tipPath: "",
    showTip: false
  },

  onLoad: function () {
    wx.clearStorageSync()
    wx.cloud.callFunction({
      name: "newSession",
      success: (res) => {
        this.setData({
          execution: res.result["execution"],
        })
        this.getCaptcha()
      }
    })
  },

  getCaptcha: function () {
    wx.downloadFile({
      url: "https://cas.shmtu.edu.cn/cas/captcha",
      success: (res) => {
        const i = res.cookies[0].indexOf(";")
        this.setData({
          captchaPath: res.tempFilePath,
          cookie: res.cookies[0].slice(0, i + 1)
        })
      }
    })
  },

  goLogin: function (event) {
    const username = event.detail.value["username"]
    const password = event.detail.value["password"]
    const captcha = event.detail.value["captcha"]
    if (username === "" || password === "") {
      this.setWrong()
      return
    }
    const records = wx.cloud.callFunction({
      name: "loginJwxt",
      data: {
        username: username,
        password: password,
        execution: this.data.execution,
        captcha: captcha,
        cookie: this.data.cookie
      },

      success: (res) => {
        if (res.result["err"] !== undefined) {
          this.setWrong()
          this.getCaptcha()
          this.setData({
            showDialog: true,
            hasResponsed: true,
          })
        } else {
          wx.setStorageSync("cookie", res.result.cookie)
          wx.setStorageSync("name", res.result.name)
          this.getRecords(res.result.cookie)
        }
      },
      fail: () => {
        this.setWrong()
        this.setData({
          showDialog: true,
          hasResponsed: true,
        })
      }
    })
    this.setData({
      showDialog: true,
      hasResponsed: false,
      wrongInfo: false
    })

  },

  getRecords: function (cookie) {
    wx.cloud.callFunction({
      name: "getEvaluationInfo",
      data: {
        cookie: cookie
      },
      success: res => {
        if (res.result["err"] !== undefined) {
          this.setWrong()
          this.setData({
            showDialog: true,
            hasResponsed: true,
          })
        }
        this.unsetWrong()

        wx.setStorageSync("records", res.result.records)
        wx.redirectTo({
          url: "/pages/record/record",
        })
      }
    })
  },

  closeDialog: function () {
    this.setData({
      showDialog: false,
      hasResponsed: false,
      wrongInfo: true
    })
  },

  showTipDialog: function () {
    wx.previewImage({
      urls: ["cloud://default-qqexg.6465-default-qqexg-1300800420/tips.png"],
    })
  },

  inputChange: function () {
    this.unsetWrong()
  },

  setWrong: function () {
    this.setData({
      cellClass: "weui-cell weui-cell_warn",
      labelClass: "weui-label label_warn",
      wrongInfo: true
    })
  },

  unsetWrong: function () {
    this.setData({
      cellClass: "weui-cell",
      labelClass: "weui-label",
      wrongInfo: false
    })
  }
});