import WebSocket from "ws";

export interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}
