import { Request, Response } from "express";
import userModel from "../../user/user.model";

class settingsController {
    async getSettings(req:Request, res:Response) {
        const settings = await userModel.findOne({}) 

        return res.status(200).json(settings)
    }
}
export default new settingsController()