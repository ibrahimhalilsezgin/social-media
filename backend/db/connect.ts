import mongoose from "mongoose";


export const connectDB = () => {
    mongoose.connect(process.env.mongouri || '').then(async () => {
        console.log('Database Bağlandı');
    }).catch((err) => {
        console.log('Database Bağlanırken Sorun Oluştu Hata: ' + err);
    });
    mongoose.set('strictPopulate', false);

    return mongoose
}