Page({
    data: {
        records: [],
        needEvaluation: false,
        name: ""
    },

    onLoad: function () {
        const records = wx.getStorageSync("records")
        const name = wx.getStorageSync("name")
        this.setData({
            records: records,
            name: name
        })

        for (let record of records) {
            if (!record.evaluated) {
                this.setData({
                    needEvaluation: true
                })
                break
            }
        }
    },

    goEvaluate: function () {
        let records = wx.getStorageSync("records")
        wx.cloud.callFunction({
            name: "goEvaluate",
            data: {
                records: wx.getStorageSync("records"),
                cookie: wx.getStorageSync("cookie")
            },

            success: res => {
                if (res.result["msg"] === undefined) {
                    // wx.redirectTo({
                    //     url: "/pages/record/record",
                    // })
                } else {
                    for (let record of records) {
                        record.evaluated = true
                    }
                    wx.setStorageSync("records", records)
                    // }
                    wx.redirectTo({
                        url: "/pages/success/success",
                    })
                }
                wx.hideToast()
            },
            fail: () => {
                // wx.redirectTo({
                //     url: "/pages/record/record",
                // })
            }
        })
        wx.showToast({
            title: "正在评教中",
            icon: "loading",
        })
    }
});