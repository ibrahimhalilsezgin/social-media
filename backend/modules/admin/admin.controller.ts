import { Request, Response } from "express";
import userModel from "../user/user.model";
import postModel from "../posts/post.model";
import conversationsModel from "../conversations/conversations.model";
import fs from "fs/promises"
import path from "path";
import mongoose from "mongoose";
import { sendNotification } from "../../utils/notification";


const FEATURE_MAP = {
    0: "sendMessage",
    1: "sendPost",
    2: "sendComment",
    3: "sendStory"
};

class settingsController {
    async stats(req:Request, res:Response) {
        const users = await userModel.find({});
        const posts = await postModel.find({});
        // const storys = await storyModel.find({});

        res.status(200).json({
            users: users,
            posts: posts,
        })
    }

    async deleteUser(req: Request, res: Response) {

        const usernameToDelete = req.body.username;
        if (!usernameToDelete) {
            return res.status(400).send('Kullanıcı adı belirtilmedi.');
        }

        const session = await mongoose.startSession();

        try {
            const userToDelete = await userModel.findOne({ username: usernameToDelete });

            if (!userToDelete) {
                return res.status(404).send('Kullanıcı bulunamadı.');
            }

            if (userToDelete.username === req.user.username) {
                return res.status(403).send('Kendini silemezsin.');
            }

            let profilePhotoPath = '';

            await session.withTransaction(async () => {
                await userModel.updateMany(
                    { $or: [{ following: usernameToDelete }, { followers: usernameToDelete }] },
                    { $pull: { following: usernameToDelete, followers: usernameToDelete } },
                    { session }
                );

                await postModel.updateMany(
                    { 'comments.username': usernameToDelete },
                    { $pull: { comments: { username: usernameToDelete } } },
                    { session }
                );
                await postModel.updateMany(
                    { likes: usernameToDelete },
                    { $pull: { comments: { username: usernameToDelete } } },
                    { session }
                );

                await postModel.deleteMany({ account_id: userToDelete._id }, { session });
                await conversationsModel.deleteOne({ username: usernameToDelete }, { session });
                await conversationsModel.findOneAndUpdate({ with: usernameToDelete }, {isOld: true} ,{ session });
                await userModel.deleteOne({ username: usernameToDelete }, { session });

                profilePhotoPath = path.join('./profilePhotos/', userToDelete.username + '.jpeg');
            });

            session.endSession();

            if (profilePhotoPath) {
                try {
                    await fs.rm(profilePhotoPath);
                } catch (fileErr) {
                    console.warn(`Profil fotoğrafı silinemedi: ${profilePhotoPath}`, fileErr.message);
                }
            }
            
            res.status(200).send('Kullanıcı ve ilişkili tüm verileri başarıyla silindi.');

        } catch (err) {
            console.error('Kullanıcı silme işlemi sırasında bir hata oluştu:', err);
            await session.endSession();
            res.status(500).send('Sunucu kaynaklı bir sorun oluştu.');
        }
    };

    async restrict(req:Request, res: Response) {
        const { username, feature } = req.body;

        const user = await userModel.findOne({ username: username });

        if(!user) return res.status(404).send('Kullanıcı Bulunamadı.');

        const featureName = FEATURE_MAP[feature];


        if (!featureName) {
            return res.status(400).send('Geçersiz Özellik Kodu.');
        };
        
        try {
            await userModel.findOneAndUpdate({ username }, {
                $addToSet: {
                    user_blocked_features: featureName
                }
            },  { new: true });
            sendNotification(req, username, {
                title:'Kısıtlama Aldın',
                content: `${featureName} özelliği engellendi.`,
                
            })
            return res.status(200).send(`'${featureName}' özelliği başarıyla engellendi.`);
        } catch (err) {
            console.log(err);
        }
    }
    async unrestrict(req:Request, res: Response) {
        const { username, feature } = req.body;

        const user = await userModel.findOne({ username: username });

        if(!user) return res.status(404).send('Kullanıcı Bulunamadı.');

        const featureName = FEATURE_MAP[feature];


        if (!featureName) {
            return res.status(400).send('Geçersiz Özellik Kodu.');
        };
        
        try {
            await userModel.findOneAndUpdate({ username }, {
                $pull: {
                    user_blocked_features: featureName
                }
            },  { new: true });
            sendNotification(req, username, {
                title:'Kısıtlaman Kaldırıldı',
                content: `${featureName} özelliğin tekrardan kullanılabilir.`,
                
            })
            return res.status(200).send(`'${featureName}' özelliği tekrardan kullanılabilir.`);
        } catch (err) {
            console.log(err);
        }
    }
}
export default new settingsController();