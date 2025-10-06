import { Request, Response } from "express";
import conversationModel from "./conversations.model";
import userModel from "../user/user.model";

class conversationsController {
    async getUserConversations(req:Request, res:Response) {
        const { username } = req.user;

        const conversations = await conversationModel.find({ username: username });

        res.status(200).json(conversations)

    }
    async getChat(req:Request, res: Response) {
        let {username, id} = req.params
        const conversation = await conversationModel.findOne({ with:username, id: id});

        if(!conversation) return res.status(404).send('Sohbet bulunamadı.');

        return res.status(200).json(conversation)
    }
    async createConversation(req:Request, res:Response) {
        let {username} = req.body;
        let id = Math.floor(Math.random() * 10000 * username.length * req.user.username.length) * 999999
        if(await conversationModel.findOne({ username: req.user.username, with: username})) return res.status(500).send('Sohbet halihazırda var.')

        const conversation = new conversationModel({
            id: id, 
            username: req.user.username,
            with: username
        }).save()

        const conversation2 = new conversationModel({
            id: id,
            username: username,
            with: req.user.username
        }).save()

        return res.status(200).json({
            message:'Sohbet Oluşturuldu',
            conversation: conversation
        })        
    }       
};

export default new conversationsController();