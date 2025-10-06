import { NextFunction, Request, Response } from "express";
import { Post } from "./post.interface";
import postModel from "./post.model";
import userModel from "../user/user.model";
import { sendNotification } from "../../utils/notification";
const categorys = {
    sport:["basketbol", "voleybol", "futbol", "tenis", "koşu", "şınav", "mekik"],
    music:["müzik", "şarkı", "albüm", "konser"],
    food:["yemek", "tarif", "kahve", "içecek", "kola", "tea", "çay"],
    politic:["politika", "siyaset", "chp", "akp","mhp"],
    fitness:["fitness", "spor", "ağırlık", "gym"],
    animals:["kedi", "köpek", "kuş", "hayvan", "papağan"],
    travel: ["gezi", "tur", "yurt dışı", "tatil", "otel", "hotel", "hostel"]
};
class postController {

    async home(req: Request, res: Response) {
        try {
            const user = await userModel.findOne({ username: req.user.username });
            if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

            const likedCategories = user.likedCategories
                .sort((a, b) => b.count - a.count)
                .map(c => c.category);

            const allPosts = await postModel.find({}).sort({ createdAt: -1 });

            const postsWithPriority = allPosts.map((p:any) => {
                let priority = likedCategories.indexOf(p.category);
                if (priority === -1) priority = likedCategories.length; 
                return { post: p, priority };
            });

            postsWithPriority.sort((a, b) => a.priority - b.priority);

            const visiblePosts = [];

            for (const item of postsWithPriority) {
                const p = item.post;
                const postUser = await userModel.findOne({ id: p.account_id });
                if (!postUser) continue;
                if (postUser.private) {
                    if (postUser.followers.includes(user.username) || p.account_id.toString() === user.username) {
                        visiblePosts.push({ post: p, user: { username: postUser.username } });
                    }
                } else {
                    visiblePosts.push({ post: p, user: { username: postUser.username } });
                }
            }

            res.json(visiblePosts);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Bir hata oluştu" });
        }
    }
    async createPost(req:Request, res: Response) {
        const { description }:Post = req.body;
        let image = req.file;
        if(!image) return res.status(500).json({
            status:'ERROR',
            message: 'Herhangi bir resim girilmedi.'
        });
        let id = Math.floor(Math.floor(Math.random() * req.user.id.length) + (await postModel.find({})).length)
        const category = detectCategory(description)
        
        new postModel({
            id: id,
            account_id: req.user.id,
            description: description,
            filename: req.file.filename,
            category: category
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
        if(post.account_id != req.user.id) return res.status(403).json({
            status:'başarısız',
            message: 'Bu postu silme yetkisine sahip değilsin.'
        });

        await postModel.findOneAndDelete({ id });

        return res.status(200).send({
            status:'başarılı',
        });
    };

    async getPostImage(req:Request, res:Response) {
        const { filename } = req.params;
        const currentUsername = req.user?.username || null;
        const post = await postModel.findOne({ filename: filename }) 
        if(!post) return res.status(404).send("Post bulunamadı");
        const user = await userModel.findOne({ id: post.account_id });

        if (!user) return res.status(404).send("Kullanıcı bulunamadı");
        if(user.username == req.user?.username) {
            return res.sendFile(`${__dirname}/uploads/${user.username}/${filename}`, (err) => {
            if (err) res.status(404).send("Dosya bulunamadı");
        });
        }
        if (user.private && (!currentUsername || !user.followers.includes(currentUsername))) {
            return res.status(403).send("Bu kullanıcıya erişemezsin");
        }

        return res.sendFile(`${__dirname}/uploads/${user.username}/${filename}`, (err) => {
            if (err) return res.status(404).send("Dosya bulunamadı");
        });
    };

    async getInfo(req:Request, res:Response) {
        const { filename } = req.params;
        const currentUsername = req.user?.username || null;
        console.log(filename)
        const post = await postModel.findOne({filename: filename});
        if(!post) return res.status(404).send('Post Bulunamadı');
        const user = await userModel.findOne({ id: post.account_id });
        if (!user) return res.status(404).send("Kullanıcı bulunamadı");
        if(user.username == req.user?.username) {
            return res.status(200).json(post);
        }
        if (user.private && (!currentUsername || !user.followers.includes(currentUsername))) {
            return res.status(403).send("Bu kullanıcıya erişemezsin");
        }

        return res.status(200).json(post);
    };
    async postPage(req:Request, res:Response) {
        console.log('ttest' , req.body.id)
        const { id } = req.body;
        console.log(id)
        const post = await postModel.findOne({ id: id });
        console.log(post)
        if(!post) return res.status(404).send('Post bulunamadı.');
        const user = await userModel.findOne({ id: post.account_id });
        if(!user) return res.status(404).send('Kullanıcı bulunamadı.');
        if(req.user) {
            if(!user.followers.includes(req.user.username)) return res.status(403).send('Kullanıcının hesabı gizlide takip etmeden postu göremezsiniz.');
        }
        res.status(200).json({
            description: post.description,
            filename: post.filename.split('.jpeg'),
            created: post.created,
            likes: post.likes,
            comments: post.comments,
        })
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
    async like(req: Request, res: Response) {
        const { filename } = req.body;
        console.log(filename)
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
            await addLikedCategories(req.user.username, post.description)
            sendNotification(req, postOwner.username, {
                title: 'Postun Beğenildi',
                content: `${req.user.username} postunuzu beğendi.`,
                url:''
            });
        } else {
            await removeLikedCategories(req.user.username, post.description)
        }

        return res.status(200).json(hasLiked ? 'Beğeni geri çekildi' : 'Post beğenildi');
    }
    async getLikes(req: Request, res:Response) {
        const {filename} = req.body;
        const post = await postModel.findOne({ filename: filename });
        if(!post) return res.status(404).send('Post bulunamadı.');
        const postOwner = await userModel.findOne({ id: post.account_id });
        if(postOwner.username != req.user.username) {

            if(postOwner.private) {
                if(!postOwner.followers.includes(req.user.username)) {
                    return res.status(403).send('Takip etmediğin gizli bir hesabın postundaki beğenileri göremezsin.');
                };

                return res.status(200).json(post.likes);
            };
        }
        return res.status(200).json(post.likes);
    };
    async getComments(req: Request, res:Response) {
        const {filename} = req.body;

        const post = await postModel.findOne({ filename: filename });

        if(!post) return res.status(404).send('Post bulunamadı.');
        const postOwner = await userModel.findOne({ id: post.account_id });
        if(postOwner.username != req.user.username) {

            if(postOwner.private) {
                if(!postOwner.followers.includes(req.user.username)) {
                    return res.status(403).send('Takip etmediğin gizli bir hesabın postundaki yorumları göremezsin.');
                };

               return res.status(200).json(post.comments);
            };
        }
        return res.status(200).json(post.comments);
    };
    async createComment(req: Request, res: Response) {
        const {filename, content} = req.body;
        console.log(filename, content)
        const post = await postModel.findOne({ filename: filename });

        if(!post) return res.status(404).send('Post bulunamadı.');
        const postOwner = await userModel.findOne({ id: post.account_id });
        
        if(postOwner.username != req.user.username) {

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
                content:`${req.user.username} postuna yorum yaptı`,
                url:''
            });
            return res.status(200).json('Yorum Yapıldı');
    }
    


    // yorum silme (post sahibi ve yorum sahibi veya ADMİN)

};
function detectCategory(postText: string) {
    let category: string[] = [];
    for (const [keyword, value] of Object.entries(categorys)) {
        for (const v of value) {
            if (postText.toLowerCase().includes(v.toLowerCase()) || postText.includes(`#${v.toLowerCase()}`)) {
                if (!category.includes(keyword)) category.push(keyword); // tekrar eklememek için
            }
        }
    }

    if (category.length === 0) {
        category.push("general");
    }

    return category;
};

async function addLikedCategories(username: string, postText: string) {
    const user = await userModel.findOne({ username });
    if (!user) return;

    const detectedCategories = detectCategory(postText);

    detectedCategories.forEach(category => {
        const existing = user.likedCategories.find(c => c.category === category);
        if (existing) {
            existing.count += 1;
        } else {
            user.likedCategories.push({ category, count: 1 });
        }
    });

    await user.save();
}

async function removeLikedCategories(username: string, postText: string) {
    const user = await userModel.findOne({ username });
    if (!user) return;

    const detectedCategories = detectCategory(postText);

    detectedCategories.forEach(category => {
        const existing = user.likedCategories.find(c => c.category === category);
        if (existing) {
            existing.count -= 1;
            if (existing.count <= 0) {
                user.likedCategories.pull(existing);
            }
        }
    });

    await user.save();
}


export default new postController();