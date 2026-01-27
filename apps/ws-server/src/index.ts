import { WebSocketServer } from "ws"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { User } from "./types.js"
import { prisma } from "@repo/db"

const wss = new WebSocketServer({ port: 8080 })

const users: User[] = []

//to check jwt token, if valid then returns authenticated userId
function checkUser(token: string): string | null {
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET)

        if(typeof decodedToken == "string")
            return null

        if(!decodedToken || !decodedToken.userId) 
            return null

        return decodedToken.userId
    } catch (error: any) {
        return null
        console.log(error.message)
    }
}

wss.on('connection', function connection(ws, Request) {

    const url = Request.url
    if (!url) {
        return
    }

    const queryParam = new URLSearchParams(url.split('?')[1])
    const token = queryParam.get('token') || ""
    const authenticatedUserId= checkUser(token)
    if(authenticatedUserId == null) {
        ws.close()
        return
    }

    users.push({
        ws: ws,
        rooms: [],
        userId: authenticatedUserId
    })

    ws.on('message', async function message(data) {

        const parsedMessage = JSON.parse(data as unknown as string)

        if(parsedMessage.type === "join") {
            const user = users.find(x => x.ws === ws)
            if(!user) 
                return
            user?.rooms.push(parsedMessage.roomId)
        }

        if(parsedMessage.type === "leave") {
            const user = users.find( x => x.ws === ws)
            if(!user) 
                return
            //@ts-ignore
            user.rooms = user?.rooms.filter( x => x === parsedMessage.room)
        }

        if(parsedMessage.type === "chat") {
            const roomId = parsedMessage.roomId
            const message = parsedMessage.message
            
            try {
                await prisma.chat.create({
                    data: {
                        roomId: roomId,
                        message: message,
                        userId: authenticatedUserId,
                    }
                })
            } catch (error: any) {
                console.log(error.message)
            }
            users.forEach( user => {
                if(user.rooms.includes(roomId)) {
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId: roomId
                    }))
                }
            })
            
        }
    })


})

