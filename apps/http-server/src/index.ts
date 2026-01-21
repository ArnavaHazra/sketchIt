import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { middleware } from "./middleware.js";
import { CreateUserSchema,CreateRoomSchema, SigninSchema } from "@repo/common/types"
import  prismaClient  from "@repo/db-common/client"

const PORT = 3001
const app = express();

app.use(express.json());

app.get("/",(req,res)=>{
    res.json({
        message: "Server is active and listening on port 3001"
    });
});

app.post("/signup", async (req, res) => {

    const parsedData = CreateUserSchema.safeParse(req.body)
    if(!parsedData.success) {
        res.json({
            message: "Invalid inputs"
        })
        return 
    }

    try {
        const response = await prismaClient.user.create({
            data: {
                name:       parsedData.data.name,
                email:      parsedData.data.username,
                //TODO: hash the password
                password:   parsedData.data.password
            }
        })
        if(response) {
            res.status(201).json({
            message: "success: User created"
            }) 
        }
    } catch (error) {
        res.status(411).json({
            message: "User with this credentials already exists"
        })
    }
  
})

app.post("/signin", async (req, res) => {

    const parsedData = SigninSchema.safeParse(req.body)
    if(!parsedData.success) {
        res.json({
            message: "Invalid inputs"
        })
        return 
    }

    const response = await prismaClient.user.findFirst({
        where: {
            email:      parsedData.data.username,
            password:   parsedData.data.password
        }        
    })

    if(!response) {
        res.status(401).json({
            message: "Unathorized"
        })
        return;
    }

    const token = jwt.sign({
        userId: response?.id
    }, JWT_SECRET)
    res.status(200).json({
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