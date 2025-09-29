import moment from "moment";
import {Schema, model, Types} from "mongoose";


const schema = new Schema({
    id:{
        type:String,
        required: true,
    },
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
    }
});

export default model('post', schema);   