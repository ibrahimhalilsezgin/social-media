import {Schema, model, Types} from "mongoose";


const schema = new Schema({
    username:{
        type:String,
        required: true,
    },
    with:{
        type:String,
        required: true,    
    },
    id:{
        type:String,
        required: true,
    },
    messages:[{
        username:String,
        content:{
            type:String,
            required: true,
            minLength:1
        },
        created: {
            type:Date,
            default: new Date()
        }
    }],
    isOld: {
        type: Boolean,
        default: false
    }
});

export default model('conversation', schema);   