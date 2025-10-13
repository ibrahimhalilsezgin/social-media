import {Schema, model} from "mongoose";

const schema = new Schema({
    id:{
        type:String,        
    },
    siteName: String,
    accessCountry: [
    {
        country: String,
        ipList: [String],   // Bu ülkeden erişen IP’lerin listesi (benzersiz tutulacak)
        count: Number       // O ülkeden toplam erişim sayısı (ipList uzunluğuna eşit olabilir)
    }]
});


export default model('settings', schema);