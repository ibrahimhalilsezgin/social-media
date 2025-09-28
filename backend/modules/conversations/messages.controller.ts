import { Request, Response } from "express";
import { Post } from "./post.inferface";
import postModel from "./post.model";
import userModel from "../user/user.model";

class postController {
    async createPost(req:Request, res: Response) {
        const { title }:Post = req.body;
        let images = req.files;
        if(images .length <= 0) return res.status(500).json({
            status:'ERROR',
            message: 'Herhangi bir resim girilmedi.'
        });
        let id = Math.floor(req.user.id * Math.floor(Math.random() * req.user.id.length) + (await postModel.find({})).length)
        new postModel({
            id: id,
            account_id: req.user.id,
            title: title,
            images:images
        }).save();

        return res.status(200).send({
            status:'başarılı',
            id: id,
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

    async getUserPosts(req:Request, res:Response) {
        const {id} = req.body;

        const user = await userModel.findOne({ id: id });

        if(!user) return res.status(404).send('Kullanıcı bulunamadı.');
        if(user.private) {
            let following = false;
            if(user.id == req.user.id) return following = true;
            user.followers.forEach(follower => {
                if(follower.id == req.user.id) following = true;
            });

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