import moment from "moment";
import {Schema, model, Types} from "mongoose";
const schema = new Schema({
    id: {
        type:String,
        required: true,
    },
    username: {
        type:String,
        required: true,
        maxLength: 32,
        minLength: 3,
        unique: true
    },
    email:{
        type:String,
        required: true,
        maxLength: 128,
        minLength: 11 
    },
    password: {
        type:String,
        required: true
    },
    profilePhoto: {
        type:String,
        required: false,
        default:'http://localhost:3000/getUserProfilePhoto/default-avatar.jpeg'
    },
    biography:{
        type:String,
        required: false,
        maxLength: 300
    },
    followers:[{
        type:String,
    }],
    following:[{
        type:String,
    }],
    followRequests:[{
        type:String,
    }],
    sendedFollowRequets:[{
        type:String,
    }],
    posts:[{
        type:String,
    }],
    private:{
        type:Boolean,
        default: false
    },
    adminLevel:{
        type:Number,
        default: 0 // 0 User, 1 Moderator, 2 Admin
    },
    created: {
        type: String,
        default: moment().locale('tr').format('lll').toString()
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: Boolean,
        default: false
    },
    verified: {
        type:Boolean,
        default: false
    },
    lastLoginIPAddress:{
        type:String
    },
    notifications:[{
        title:String,
        content: String,
        url:String,
        created: {
            type:String,
            default: moment().locale('tr').format('lll').toString()
        }

    }],
    likedCategories: [
        {
            category: { type: String, required: true },
            count: { type: Number, default: 0 }
        }
    ]

});
export default model('user', schema);