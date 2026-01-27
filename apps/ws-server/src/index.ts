import { WebSocketServer } from "ws"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"

const wss = new WebSocketServer({ port: 8080 })

//to check jwt token
function checkUser(token: string): string | null {
    const decodedToken = jwt.verify(token, JWT_SECRET)

    if(typeof decodedToken == "string")
        return null

    if(!decodedToken || !decodedToken.userId) 
        return null

    return decodedToken.userId
}

wss.on('connection', function connection(ws, Request) {

    const url = Request.url
    if (!url) {
        return
    }

    const queryParam = new URLSearchParams(url.split('?')[1])
    const token = queryParam.get('token') || ""
    const authenticatedUserId= checkUser(token)
    if(!authenticatedUserId)
        ws.close()

    

    ws.on('message', function message(data) {
        ws.send('pong')
        console.log('received: %s', data)
    })


})

