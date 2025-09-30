import { connectDB } from "../db/connect";
import userModel from "../modules/user/user.model";
connectDB();


export const sendNotification = async (req:Request, username:string, options={title:'', content:'', url:''}) => {
    const io = req.app.get("io");
    
    io.to(username).emit("notification", {
        title:options.title,
        content: options.content,
        url: options.url
    });

    await userModel.findOneAndUpdate(
        { username: username },
        {
            $push: {
                notifications: {
                    title:options.title,
                    content: options.content,
                    url: options.url, 
                }
            }
    });
}
