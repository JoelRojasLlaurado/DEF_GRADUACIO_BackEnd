import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import Logging from '../library/Logging';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    role?: string;
}

let io: SocketServer | null = null;
const adminConnections = new Map<string, AuthenticatedSocket>();

export const initializeWebSocket = (httpServer: HttpServer): SocketServer => {
    io = new SocketServer(httpServer, {
        cors: {
            origin: ['http://localhost:4200', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:1337'],
            credentials: true
        }
    });

    io.on('connection', (socket: AuthenticatedSocket) => {
        Logging.info(`Socket connected: ${socket.id}`);

        // Authenticate socket on connection
        socket.on('authenticate', (token: string) => {
            try {
                const decoded: any = jwt.verify(token, config.jwt.accessSecret);
                socket.userId = decoded.id;
                socket.role = decoded.role;

                // Solo registrar si es admin
                if (socket.role === 'admin') {
                    adminConnections.set(socket.id, socket);
                    Logging.info(`Admin authenticated: ${socket.userId}`);
                    socket.emit('authenticated', { success: true, role: socket.role });
                } else {
                    socket.emit('authenticated', { success: false, message: 'Only admin users can connect' });
                    socket.disconnect();
                }
            } catch (error) {
                Logging.error(`Socket authentication failed: ${error}`);
                socket.emit('authenticated', { success: false, message: 'Authentication failed' });
                socket.disconnect();
            }
        });

        socket.on('disconnect', () => {
            adminConnections.delete(socket.id);
            Logging.info(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = (): SocketServer | null => {
    return io;
};

export const getAdminConnections = (): Map<string, AuthenticatedSocket> => {
    return adminConnections;
};

export const broadcastScanEvent = (eventData: any) => {
    if (io && adminConnections.size > 0) {
        io.to(Array.from(adminConnections.keys())).emit('scan_action', eventData);
        Logging.info(`Broadcast scan event to ${adminConnections.size} admins`);
    }
};
