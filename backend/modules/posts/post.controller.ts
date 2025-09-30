import { NextFunction, Request, Response } from "express";
import { Post } from "./post.inferface";
import postModel from "./post.model";
import path from "path";
import userModel from "../user/user.model";
import fs from "fs";
import { authenticateToken } from "../../middleware/authentication";
import { sendNotification } from "../../utils/notification";
class postController {
    async createPost(req:Request, res: Response) {
        const { description }:Post = req.body;
        let image = req.file;
        if(!image) return res.status(500).json({
            status:'ERROR',
            message: 'Herhangi bir resim girilmedi.'
        });
        let id = Math.floor(req.user.id * Math.floor(Math.random() * req.user.id.length) + (await postModel.find({})).length)
        new postModel({
            id: id,
            account_id: req.user.id,
            description: description,
            filename: req.file.filename
        }).save();
        await userModel.findOneAndUpdate({ id: req.user.id }, {
            $push:{
                posts: req.file.filename
            }
        })
        return res.status(200).send({
            status:'başarılı',
            filename: req.file.filename,
        });
    };
    async deletePost(req:Request, res: Response) {
        const { id }:Post = req.body;
        const post = await postModel.findOne({ id });
        if(!post.account_id == req.user.id) return res.status(403).json({
            status:'başarısız',
            message: 'Bu postu silme yetkisine sahip değilsin.'
        });

        await postModel.findOneAndDelete({ id });

        return res.status(200).send({
            status:'başarılı',
        });
    };
    async getPost(req:Request, res:Response) {
        const { username, filename } = req.params;
        const currentUsername = req.user?.username || null;

        const user = await userModel.findOne({ username });
        if (!user) return res.status(404).send("Kullanıcı bulunamadı");
        if(user.username == req.user?.username) {
            return res.sendFile(`${__dirname}/uploads/${username}/${filename}`, (err) => {
            if (err) res.status(404).send("Dosya bulunamadı");
        });
        }
        if (user.private && (!currentUsername || !user.followers.includes(currentUsername))) {
            return res.status(403).send("Bu kullanıcıya erişemezsin");
        }

        return res.sendFile(`${__dirname}/uploads/${username}/${filename}`, (err) => {
            if (err) return res.status(404).send("Dosya bulunamadı");
        });
    };
    async getInfo(req:Request, res:Response) {
        const { username, filename } = req.params;
        const currentUsername = req.user?.username || null;

        const user = await userModel.findOne({ username });
        if (!user) return res.status(404).send("Kullanıcı bulunamadı");
        const post = await postModel.findOne({filename: filename});
        if(!post) return res.status(404).send('Post Bulunamadı')
        if(user.username == req.user?.username) {
            return res.status(200).json(post);
        }
        if (user.private && (!currentUsername || !user.followers.includes(currentUsername))) {
            return res.status(403).send("Bu kullanıcıya erişemezsin");
        }

        return res.status(200).json(post);

    };
    async getUserPosts(req:Request, res:Response) {
        const {id} = req.body;

        const user = await userModel.findOne({ id: id });

        if(!user) return res.status(404).send('Kullanıcı bulunamadı.');
        if(user.private) {
            let following = false;
            if(user.id == req.user.id) return following = true;
            following  = user.followers.includes(req.user.username);
            if (following) {                                    
                return res.status(200).json({
                    id: user.id,
                    posts: user.posts
                });
            } else {
                    return res.status(403).send('Bu kişiyi takip etmiyorsun.');
                };
        } else {
            return res.status(200).json({
                id: user.id,
                posts: user.posts
            });
        }

    };
async like(req: Request, res: Response) {
    const { filename } = req.body;

    const post = await postModel.findOne({ filename });
    if (!post) return res.status(404).send('Post bulunamadı.');

    const postOwner = await userModel.findOne({ id: post.account_id });
    if (!postOwner) return res.status(404).send('Post sahibi bulunamadı.');

    if (!req.user) return res.status(403).send('Giriş yapmanız gerekiyor.');

    const isSelf = postOwner.username === req.user.username;

    if (!isSelf && postOwner.private && !postOwner.followers.includes(req.user.username)) {
        return res.status(403).send('Takip etmediğiniz gizli bir hesabın postunu beğenemezsiniz.');
    }

    const hasLiked = post.likes.includes(req.user.username);
    const update = hasLiked
        ? { $pull: { likes: req.user.username } }
        : { $push: { likes: req.user.username } };

    await postModel.findOneAndUpdate({ filename }, update);

    if (!hasLiked && !isSelf) {
        sendNotification(req, postOwner.username, {
            title: 'Postun Beğenildi',
            content: `${req.user.username} postunuzu beğendi.`,
        });
    }

    return res.status(200).json(hasLiked ? 'Beğeni geri çekildi' : 'Post beğenildi');
}

    async getLikes(req: Request, res:Response) {
        const {filename} = req.body;

        const post = await postModel.findOne({ filename: filename });

        if(!post) return res.status(404).send('Post bulunamadı.');
        const postOwner = await userModel.findOne({ id: post.account_id });
        if(!postOwner.username == req.user.username) {

            if(postOwner.private) {
                if(!postOwner.followers.includes(req.user.username)) {
                    return res.status(403).send('Takip etmediğin gizli bir hesabın postundaki beğenileri göremezsin.');
                };

                res.status(200).json(post.likes);
            };
        }
        res.status(200).json(post.likes);
    };
    async getComments(req: Request, res:Response) {
        const {filename} = req.body;

        const post = await postModel.findOne({ filename: filename });

        if(!post) return res.status(404).send('Post bulunamadı.');
        const postOwner = await userModel.findOne({ id: post.account_id });
        if(!postOwner.username == req.user.username) {

            if(postOwner.private) {
                if(!postOwner.followers.includes(req.user.username)) {
                    return res.status(403).send('Takip etmediğin gizli bir hesabın postundaki yorumları göremezsin.');
                };

                res.status(200).json(post.comments);
            };
        }
        res.status(200).json(post.comments);
    };


    async createComment(req: Request, res: Response) {
        const {filename, content} = req.body;
        console.log(filename, content)
        const post = await postModel.findOne({ filename: filename });

        if(!post) return res.status(404).send('Post bulunamadı.');
        const postOwner = await userModel.findOne({ id: post.account_id });
        
        if(!postOwner.username == req.user.username) {

            if(postOwner.private) {
                    if(!postOwner.followers.includes(req.user.username)) {
                        return res.status(403).send('Takip etmediğin gizli bir hesabın postuna yorum yapamazsın.');
                    };

                    await postModel.findOneAndUpdate({ filename: filename }, {
                        $push:{ comments: {
                            username: req.user.username,
                            content: content,
                            likes:[]
                        }}
                    });
                    return res.status(200).json('Yorum Yapıldı');
                }
        }
            await postModel.findOneAndUpdate({ filename: filename }, {
                $push:{ comments: {
                    username: req.user.username,
                    content: content,
                    likes:[]
                }}
            });
            sendNotification(req, postOwner.username, {
                title:`Postuna yorum yapıldı`,
                content:`${req.user.username} postuna yorum yaptı`
            });
            return res.status(200).json('Yorum Yapıldı');
    }



    // yorum silme (post sahibi ve yorum sahibi veya ADMİN)

};

export default new postController();