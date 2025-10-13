import mongoose from "mongoose";
import settingsModel from "../modules/admin/admin.model";


export const connectDB = async () => {
    mongoose.connect(process.env.mongouri || '').then(async () => {
        console.log('Database Bağlandı');
    }).catch((err) => {
        console.log('Database Bağlanırken Sorun Oluştu Hata: ' + err);
    });
    mongoose.set('strictPopulate', false);
    if(!await settingsModel.findOne({ id:'DEFAULT' })) {
        new settingsModel({
            id:'DEFAULT',
            siteName:'DEFAULT'
        }).save()
        console.log('Default Ayarlar bulunamadı yenisi oluşturuldu')
    }
    return mongoose
}