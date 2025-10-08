import userModel from "../modules/user/user.model";

interface NotificationOptions {
  title: string;
  content?: string;
  url?: string;
  image?: string; 
  socket?: any;
}

export const sendNotification = async (
  req: any,
  username: string,
  options: NotificationOptions = {
    title:''
  }
) => {
  const io = options.socket || req.app.get("io");

  io.to(username).emit("notification", {
    title: options.title || "",
    content: options.content || "",
    url: options.url || "",
    image: options.image || "",
  });

  await userModel.findOneAndUpdate(
    { username },
    {
      $push: {
        notifications: {
          title: options.title,
          content: options.content || "",
          url: options.url || "",
          ...(options.image && { image: options.image }), 
        },
      },
    }
  );
};
