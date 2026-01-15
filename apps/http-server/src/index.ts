import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { middleware } from "./middleware.js";
import { CreateUserSchema, CreateRoomSchema, SigninSchema } from "@repo/common/types"

const PORT = 3001
const app = express();

app.post("/signup", (req, res) => {

    const data = CreateUserSchema.safeParse(req.body)
    if(!data.success) {
        res.json({
            message: "Invalid inputs"
        })
        return 
    }
    //TODO: db call
    res.json({
        userId: "123"
    })    
})

app.post("/signin", (req, res) => {

    const data = SigninSchema.safeParse(req.body)
    if(!data.success) {
        res.json({
            message: "Invalid inputs"
        })
        return 
    }

    const userId = 123;
    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    res.json({
        token: token
    })
    
})

app.post("/room", middleware, (req, res) => {

    const data = CreateRoomSchema.safeParse(req.body)
    if(!data.success) {
        res.json({
            message: "Invalid inputs"
        })
        return 
    }
    //TODO: db call
    res.json({
        roomId: 123
    })
})

app.listen(PORT, () => {
    console.log("Server is LIVE on PORT:", PORT)
});