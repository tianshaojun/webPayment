const express = require('express');
const mongoose = require("mongoose");
const xml2js = require("xml2js");
const {
    signPayParams,
    // getJsAPITicket,
    // signParams,
    // appid,
    // fullUrl,
    // getOauthUrl,
    // getOpenId
} = require("./utils/wx");
const Order = require("./models/order");
const app = express();

app.get('/', (req, res) => {
    res.send('hello world!');
});

app.use("/", express.static("./public"));

// app.use(cookieParser());
app.use(express.json());
app.use(
    express.urlencoded({
        extended: false
    })
);

app.use("/api/v1/wechats", require("./api/v1/wechats"));

//支付结果通知
app.post("/pay/notify_wx", async (req, res) => {
    var buf = "";
    req.on("data", chunk => {
        buf += chunk;
    });
    req.on("end", async () => {
        const payResult = await xml2js.parseStringPromise(buf, {
            explicitArray: false
        });
        try {
            if (payResult.xml.return_code == "SUCCESS") {
                const paramsNeedSign = {};
                for (let k in payResult.xml) {
                    if (k != "sign") {
                        paramsNeedSign[k] = payResult.xml[k];
                    }
                }
                const sign = signPayParams(paramsNeedSign);
                if (sign == payResult.xml.sign) {
                    const orderNo = payResult.xml.out_trade_no;
                    const order = await Order.findOne({
                        order_no: orderNo
                    });
                    if (order) {
                        order.payed = true;
                        order.payed_time = Date.now();
                        await order.save();
                    }
                }
            }
            res.send(`<xml>
        <return_code><![CDATA[SUCCESS]]></return_code>
        <return_msg><![CDATA[OK]]></return_msg>
      </xml>`);
        } catch (err) {
            res.json(err);
        }
    });
});

app.listen(3003, () => {
    console.log('server is running on 3003');
});

mongoose
    .connect("mongodb://localhost:27017/cat-shop", {
        useNewUrlParser: true
    })
    .then(res => {
        console.log("数据库连接成功");
    })
    .catch(err => {
        console.log(err);
    });