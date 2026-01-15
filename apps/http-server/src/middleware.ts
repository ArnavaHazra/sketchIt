import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";

export const middleware = (req: Request, res:Response, next:NextFunction) => {
    const token = req.headers["authorization"] ?? ""

    const decodedToken = jwt.verify(token, JWT_SECRET)

    if(decodedToken){
        //@ts-ignore TODO
        req.userId = decodedToken.userId
        next();
    } else {
        res.status(403).json({
            message: "Unauthorized"
        })
    }
}