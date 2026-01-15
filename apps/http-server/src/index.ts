import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./config.js";
import { middleware } from "./middleware.js";

const PORT = 3001
const app = express();

app.post("/signup", (req, res) => {
    //TODO: db call
    res.json({
        userId: "123"
    })    
})

app.post("/signin", (req, res) => {

    const userId = 123;
    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    res.json({
        token: token
    })
    
})

app.post("/room", middleware, (req, res) => {
    //TODO: db call
    res.json({
        roomId: 123
    })
})

app.listen(PORT, () => {
    console.log("Server is LIVE on PORT:", PORT)
});