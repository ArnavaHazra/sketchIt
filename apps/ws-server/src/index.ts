import { WebSocketServer } from "ws"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "./config.js"

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', function connection(ws, Request) {

    const url = Request.url
    if (!url) {
        return
    }

    const queryParam = new URLSearchParams(url.split('?')[1])
    const token = queryParam.get('token') || ""
    const decodedToken = jwt.verify(token, JWT_SECRET)

    if(!decodedToken || ! (decodedToken as JwtPayload).userId) {
        ws.close()
        return
    }

    ws.on('message', function message(data) {
        ws.send('pong')
        console.log('received: %s', data)
    })


})

