import moment from "moment";
import {Schema, model, Types} from "mongoose";


const schema = new Schema({
    account_id:{
        type:String,
        required: true,
    },
    description:{
        type:String,
        min:0,
        max: 128
    },
    filename:String,
    created:{
        type:String,
        default:moment().locale('tr').format('lll').toString()
    },
    likes:[String],
    comments:[{
        username:String,
        content:String,
        likes:[String]
    }]
});

export default model('post', schema);   