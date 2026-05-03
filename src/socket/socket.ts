import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "./socket.auth.js";
import { envVars } from "../app/config/env.js";
import { MySocketData } from "../app/interfaces/socket.interfaces.js";

export const initializeSocket = (httpServer: HttpServer) => {
    // 1. Initialize the Socket Server with CORS
    const io = new Server(httpServer, {
        cors: {
            origin: envVars.CLIENT_URL, // e.g., "http://localhost:3000"
            credentials: true,
        },
    });

    // 2. Apply your custom auth middleware
    io.use(socketAuthMiddleware);

    // 3. Handle the connection
    io.on("connection", (socket: Socket<any, any, any, MySocketData>) => {
        // Because of your middleware, we know socket.data is perfectly typed and populated!
        const { userId, workspaceIds } = socket.data;

        console.log(`🟢 Socket connected: User ${userId} (ID: ${socket.id})`);

        // 4. Join multi-tenant rooms and announce presence
        workspaceIds.forEach((workspaceId) => {
            const roomName = `workspace:${workspaceId}`;
            
            // Put the socket inside the specific workspace room
            socket.join(roomName);

            // Broadcast to EVERYONE ELSE in this room that the user is online
            socket.to(roomName).emit("presence:update", {
                userId,
                status: "online",
            });
        });

        // 5. Handle disconnection cleanly
        socket.on("disconnect", () => {
            console.log(`🔴 Socket disconnected: User ${userId}`);

            // Broadcast to the rooms that the user went offline
            workspaceIds.forEach((workspaceId) => {
                socket.to(`workspace:${workspaceId}`).emit("presence:update", {
                    userId,
                    status: "offline",
                });
            });
        });
    });

    return io;
};