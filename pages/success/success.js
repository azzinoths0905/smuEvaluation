Page({
    data: {
        tipPath: "",
        showTip: false
    },

    complete: function () {
        wx.redirectTo({
            url: "/pages/record/record"
        })
    },

    showTipDialog: function () {
        wx.previewImage({
            urls: ["cloud://default-qqexg.6465-default-qqexg-1300800420/tips.png"],
        })
    },

    closeTipDialog: function () {
        this.setData({
            showTip: false
        })
    },
})