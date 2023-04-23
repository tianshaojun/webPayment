const router = require("express").Router();
const Order = require("../../models/order");
const { wxPay } = require("../../utils/wx");

router.post("/pay", async (req, res) => {
    const openid = req.body.openid;
    const tradeType = req.body.tradeType || "NATIVE";
    const order = new Order();
    order.order_no = "D" + Date.now();
    order.fee = req.body.fee;
    await order.save();

    const nonceStr = Date.now();

    const sign = await wxPay(
        {
            body: "测试下单",
            orderNo: order.order_no,
            ip: "14.90.188.21",
            totalFee: order.fee * 100,
            openid,
            nonceStr
        },
        tradeType
    );
    if (sign.xml.return_code == "SUCCESS" && sign.xml.result_code == "SUCCESS") {
        res.json({
            code: 1,
            info: {
                noncestr: nonceStr,
                prepay_id: sign.xml.prepay_id,
                paySign: sign.xml.sign,
                codeUrl: sign.xml.code_url,
                orderNo: order.order_no
            }
        });
    } else {
        res.json({
            code: 0,
            err: sign
        });
    }
});

module.exports = router;
