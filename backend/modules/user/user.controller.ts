import {Response, Request} from "express"
import {User} from "./user.interface"
import userModel from "./user.model";
import {hashSync,compareSync} from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios"
class userController {
    async createAccount(req:Request, res:Response) {
        let {username, email, password}:User = req.body;

        if(!username || !email || !password) return res.status(403).send('Tüm boşluklar doldurulmalıdır.');

        if(await userModel.findOne({ username })) return res.status(409).send('Kullanıcı adı halihazırda kullanılmaktadır.');
        if(await userModel.findOne({ email })) return res.status(409).send('Bu e-posta halihazırda kullanılmaktadır.');
        if(password.length < 6) return res.status(422).send('Şifreniz minimum 6 harf/sayı/işaret içermelidir.');


        const hashedPassword = hashSync(password,10);
        let id = `${(await userModel.find({})).length}${username.length}${Math.floor(email.length * 0.75)}${Math.floor(Math.random() * 999999999) + 1}`;
        new userModel({
          id,
          username,
          email,
          password: hashedPassword
        }).save();


        return res.status(200).json({
          status:'Kullanıcı Oluşturuldu.',
          username: username,
        });
    };
    async SigIn(req:Request, res:Response) {
      let {input, password} = req.body;

      const IPAddress = req.ip?.toString()

      if(isValidEmail(input)) {
          const user:any = await userModel.findOne({ email: input });
          if(!user) return res.status(404).send('Kullanıcı bulunamadı.');
          if(!compareSync(password, user.password)) return res.status(403).send('Üzgünüz, şifren yanlıştı. Lütfen şifreni dikkatlice kontrol et.');
          
          const token = jwt.sign({id: user.id, username: user.username, email: user.email}, process.env.secretKey || '');
          await userModel.findOneAndUpdate({ email: input }, {lastLoginIPAddress: IPAddress});

          return res.status(200).json({
            status:'başarılı',
            token: token
          });
      } else {
          const user:any = await userModel.findOne({ username: input });
          if(!user) return res.status(404).send('Kullanıcı bulunamadı.');
          if(!compareSync(password, user.password)) return res.status(403).send('Üzgünüz, şifren yanlıştı. Lütfen şifreni dikkatlice kontrol et.');
          
          const token = jwt.sign({id: user.id, username: user.username, email: user.email}, process.env.secretKey || '');
          await userModel.findOneAndUpdate({ username: input }, {lastLoginIPAddress: IPAddress});

          return res.status(200).json({
            status:'başarılı',
            token: token
          });
      }
    };

    async getUser(req:Request, res:Response) {
      const {id}:User = req.user;

      const user = await userModel.findOne({ id: id });

      if(!user) return res.status(404).send('Kullanıcı bulunamadı.');

      return res.status(200).json({
          id: user.id,
          username: user.username,
          email: user.email,
          profilePhoto: user.profilePhoto,
          biography: user.biography,
          followers: user.followers,
          following: user.following,
          posts: user.posts,
          private: user.private,
          created: user.created,
          createdAt: user.createdAt,
          status: user.status,
          verified: user.verified
      });
    };
    async getSelfInfo(req:Request, res:Response) {
      const user = await userModel.findOne({ id: req.user.id });

      if(!user) return res.status(404).send('Kullanıcı bulunamadı.');

      res.status(200).json({
        username: user.username,
        profilePhoto: user.profilePhoto,
        biography: user.biography,
        followers: user.followers,
        following: user.following,
        followRequests: user.followRequests,
        sendedFollowRequets: user.sendedFollowRequets,
        created: user.created,
        createdAt: user.createdAt,
        verified: user.verified
      });
    }
    async getUserFromUsername(req:Request, res:Response) {
      const { username } = req.body;
      console.log(username)
      const user = await userModel.findOne({ username });

      if(!user) return res.status(404).send('Kullanıcı bulunamadı.');

      if(user.private) {
        return res.status(200).json({
          id: user.id,
          username: user.username,
          profilePhoto: user.profilePhoto,
          biography: user.biography,
          followers: user.followers.length,
          following: user.following.length,
          posts: user.posts.length,
          private: user.private,
          created: user.created,
          createdAt: user.createdAt,
          status: user.status,
          verified: user.verified
        });
      } else {
          return res.status(200).json({
            id: user.id,
            username: user.username,
            profilePhoto: user.profilePhoto,
            biography: user.biography,
            followers: user.followers,
            following: user.following,
            posts: user.posts,
            private: user.private,
            created: user.created,
            createdAt: user.createdAt,
            status: user.status,
            verified: user.verified
        });
      }
    };
    async followUser(req:Request, res:Response) {
      const user = await userModel.findOne({ id: req.user.id });
      if(!user) return;

      let { username } = req.body;
      if(username == user.username) return res.status(422).send('Kendine istek atamazsın.');
      const fUser = await userModel.findOne({ username })
      if(!fUser) return res.status(404).send('Kullanıcı bulunamadı.');
      if(user.following.includes(fUser.username)) return res.status(500).send('Zaten bu kişiyi takip ediyorsun.');

      if(fUser.private) {
        if(fUser.followRequests.includes(user.username)) return res.status(500).send('İstek zaten göndermişsiniz.');
        await userModel.findOneAndUpdate({ id: fUser.id }, {
          $push:{
            followRequests:[user.username]
          }
        });
        await userModel.findOneAndUpdate({ id: user.id }, {
          $push:{
            sendedFollowRequets:[fUser.username]
          }
        });
        return res.status(200).send('Takip isteği yollandı');
      };
      
      await userModel.findOneAndUpdate({ id: fUser.id }, {
        $push:{
            followers:[user.username]
        }
      });
      
      await userModel.findOneAndUpdate({ id: req.user.id }, {
        $push:{
          following:[fUser.username]
        }
      });

      return res.status(200).send('Takip edildi.');
    };
    async unfollowUser(req:Request, res:Response) {
      const user = await userModel.findOne({ id: req.user.id });
      if(!user) return;

      let { username } = req.body;
      if(!username == user.username) return res.status(422).send('Kendini kendinden cikartamazsın a - a = a.');
      const fUser = await userModel.findOne({ username })
      if(!fUser) return res.status(404).send('Kullanıcı bulunamadı.');
      if(!user.following.includes(fUser.username)) return res.status(500).send('Zaten bu kişiyi takip etmiyorsun.');
      
      await userModel.findOneAndUpdate({ id: fUser.id }, {
        $pull:{
            followers:user.username
        }
      });
      await userModel.findOneAndUpdate({ id: req.user.id }, {
        $pull:{
          following:fUser.username
        }
      });
      console.log('takipten cikti')
      return res.status(200).send('Takipten çıkıldı.');
    }
    async getFollowRequests(req: Request, res:Response) {
      const user = await userModel.findOne({ id: req.user.id }).populate('user');
      
      if(!user) return res.status(404).send('Kullanıcı bulunamadı.');
      
      let requ:any = [];


      for(const request of user.followRequests) {
        const response = await axios({
            url:`http://${process.env.domain}:${process.env.PORT}/getUserFromUsername`,
            method:'GET',
            data:{
              username: request
            }
        });

        requ = [response.data, ...requ];

      }
      
      res.json(requ);
    };
    async acceptFollowRequest(req: Request, res: Response) {
        try {
          const user = await userModel.findOne({ id: req.user.id });
          const { username } = req.body;

          if (!user) {
            return res.status(404).send("Kullanıcı bulunamadı.");
          }

          if (!user.followRequests.includes(username)) {
            return res.status(404).send("Böyle bir isteğin bulunmuyor.");
          }

          await userModel.findOneAndUpdate(
            { id: req.user.id },
            {
              $pull: { followRequests: username },
              $push: { followers: username },
            }
          );
          await userModel.findOneAndUpdate({ username: username }, {
            $pull: {
              sendedFollowRequets: req.user.username
            },
            $push:{
              following: req.user.username
            }
          })
          res.status(200).send("Takip isteği kabul edildi.");
        } catch (err) {
          console.error(err);
          res.status(500).send("Sunucu hatası.");
        }
    };
    async declineFollowRequest(req: Request, res: Response) {
        try {
          const user = await userModel.findOne({ id: req.user.id });
          const { username } = req.body;

          if (!user) {
            return res.status(404).send("Kullanıcı bulunamadı.");
          }

          if (!user.followRequests.includes(username)) {
            return res.status(404).send("Böyle bir isteğin bulunmuyor.");
          }

          await userModel.findOneAndUpdate(
            { id: req.user.id },
            {
              $pull: { followRequests: username },
            }
          );
          await userModel.findOneAndUpdate({ username: username }, {
            $pull: {
              sendedFollowRequets: req.user.username
            }
          })
          res.status(200).send("Takip isteği kabul edildi.");
        } catch (err) {
          console.error(err);
          res.status(500).send("Sunucu hatası.");
        }
    };
    async cancelFollowRequest(req:Request, res:Response) {
      try {
        const user = await userModel.findOne({ id: req.user.id });
        const { username } = req.body;
        if(!user) return res.status(404).send('Kullanıcı bulunamadı.');

        if(!user.sendedFollowRequets.includes(username)) return res.status(404).send('Bu kişiye zaten istek göndermemişsin.');

        await userModel.findOneAndUpdate({ id:req.user.id }, {
          $pull: {
            sendedFollowRequets:username
          }
        });

        await userModel.findOneAndUpdate({ username: username }, {
          $pull: {
            followRequests: req.user.username
          }
        });

        return res.status(200).send('İstek geri çekildi.')
      } catch(err) {
        if(err) return console.error(err);
      };
    };
};

function isValidEmail(email:string) {
  if(!email) return true  ;
  const re = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return re.test(email);
}


export default new userController();