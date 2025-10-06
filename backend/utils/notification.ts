import userModel from "../modules/user/user.model";


export const sendNotification = async (req:any, username:string, options={title:'', content:'', url: ''}) => {
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
