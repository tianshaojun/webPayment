const axios = require("axios").default;
const crypto = require("crypto");
const qs = require("qs"); //使用qs模块做字符串转换

// const appid = ""; // 公众账号id
// const mchid = ""; // 商户号
// const notifyUrl = ""; // 回调地址
// const mchKey = ""; // 商户密钥


//支付签名
function signPayParams(params) {
    const sortedParams = Object.keys(params)
        .sort()
        .reduce((pre, cur) => ({ ...pre, [cur]: params[cur] }), {});
    sortedParams.key = mchKey;
    const signResult = crypto
        .createHash("MD5")
        .update(qs.stringify(sortedParams, { encode: false }))
        .digest("hex")
        .toUpperCase();
    return signResult;
}

async function wxPay(payload, tradeType = "NATIVE") {
    const { body, orderNo, ip, totalFee, nonceStr, openid } = payload;
    const paramsNeedSign = {
        appid,
        mch_id: mchid,
        body,
        nonce_str: nonceStr,
        spbill_create_ip: ip,
        notify_url: notifyUrl,
        total_fee: totalFee,
        trade_type: tradeType,
        out_trade_no: orderNo
    };
    let strOpendId = "";
    if (openid) {
        paramsNeedSign.openid = openid;
        strOpendId = `<openid>${openid}</openid>`;
    }
    const sign = signPayParams(paramsNeedSign);
    const sendXml = `<xml>
    <appid>${appid}</appid>
    <body>${body}</body>
    <mch_id>${mchid}</mch_id>
    <nonce_str>${nonceStr}</nonce_str>
    <notify_url>${notifyUrl}</notify_url>
    <out_trade_no>${orderNo}</out_trade_no>
    ${strOpendId}
    <spbill_create_ip>${ip}</spbill_create_ip>
    <total_fee>${totalFee}</total_fee>
    <trade_type>NATIVE</trade_type>
    <sign>${sign}</sign>
  </xml>`;
    const result = await axios.post(
        "https://api.mch.weixin.qq.com/pay/unifiedorder",
        sendXml,
        {
            headers: {
                "content-type": "application/xml"
            }
        }
    );
    // console.log(result.data);
    return await xml2js.parseStringPromise(result.data, {
        cdata: true,
        explicitArray: false
    });
}