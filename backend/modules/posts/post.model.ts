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
    title:String,
    images:[{
        type:String
    }],
    created:{
        type:String,
        default:moment().locale('tr').format('lll').toString()
    }
});

export default model('post', schema);   