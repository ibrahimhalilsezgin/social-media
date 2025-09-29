import { NextFunction, Request, Response } from "express";
import { Post } from "./post.inferface";
import postModel from "./post.model";
import path from "path";
import userModel from "../user/user.model";
import fs from "fs";
import { authenticateToken } from "../../middleware/authentication";
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
        if(!post?.account_id == req.user.id) return res.status(403).json({
            status:'başarısız',
            message: 'Bu postu silme yetkisine sahip değilsin.'
        });

        await postModel.findOneAndDelete({ id });

        return res.status(200).send({
            status:'başarılı',
        });
    };

    async getPost(req:Request, res:Response, next:NextFunction) {
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
    }
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
};

export default new postController();