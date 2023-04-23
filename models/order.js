const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
    {
        order_no: {   //订单号
            type: String,
            required: true
        },
        fee: {   //金额
            type: Number,
            default: 0
        },
        address: {
            type: String,
            default: ""
        },
        payed: {  //是否支付
            type: Boolean,
            default: false
        },
        payed_time: {  //支付时间
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("order", orderSchema);
