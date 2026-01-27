import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { middleware } from "./middleware.js";
import { CreateUserSchema,CreateRoomSchema, SigninSchema } from "@repo/common/types"
import {prisma} from "@repo/db";

const PORT = 3001
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "----Server is LIVE-------"
    })
})

app.post("/signup", async (req, res) => {

    const parsedData = CreateUserSchema.safeParse(req.body)
    if(!parsedData.success) {
        res.json({
            message: "Invalid inputs"
        })
        return 
    }

    try {
        const response = await prisma.user.create({
            data: {
                name:       parsedData.data.name,
                email:      parsedData.data.username,
                //TODO: hash the password
                password:   parsedData.data.password
            }
        })
        if(response) {
            res.status(201).json({
                message: "success: User created",
                userId: response.id
            }) 
        }
    } catch (error:any) {
        console.log("Error in signup route")
        console.log(error.message)

        res.status(411).json({
            message: "Error in Signup..."
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

    try {
        const response = await prisma.user.findFirst({
            where: {
                email:      parsedData.data.username,
                password:   parsedData.data.password
            }        
        })

        if(!response) {
            res.status(401).json({
                message: "User not found"
            })
            return;
        }

        const token = jwt.sign({
            userId: response?.id
        }, JWT_SECRET)

        res.status(200).json({
            message: "Signin success",
            token: token
        })
    } catch (error: any) {
        console.log("Error in signin route")
        console.log(error.message)

        res.status(411).json({
            message: "Unauthorized..."
        })
    }
})

app.post("/room", middleware, async (req, res) => {

    const parsedData = CreateRoomSchema.safeParse(req.body)
    if(!parsedData.success) {
        res.status(403).json({
            message: "Invalid inputs"
        })
        return;
    }

    try {
        //@ts-ignore
        const userId = req.userId;
        
        const response = await prisma.room.create({
            data: {
                slug: parsedData.data.slug,
                adminId: userId
            }
        })

        if(!response) {
            res.status(401).json({
                message: "Room creation failed"
            })
            return;
        }

        res.status(200).json({
            message: "Room created",
            RoomName: response.slug 
        })
    } catch (error: any) {
        console.log("Error in room route")
        console.log(error.message)

        res.status(500).json({
            message: "Error creating Room"
        })
    }
})

app.get("/chat/:roomId", async (req, res) => {
    const roomId = Number(req.params.roomId)
    try {
        const message = await prisma.chat.findMany({
            where: {
                roomId: roomId             
            },
            orderBy:{
                id: "desc"
            },
            take: 50
        })

        res.status(200).json({
            message: message
        })        
    } catch (error: any) {
        console.log("Error in chat route")
        console.log(error.message)

        res.status(500).json({
            message: "Error getting messages"
        })
    }
})

app.listen(PORT, () => {
    console.log("Server is LIVE on PORT:", PORT)
});