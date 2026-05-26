import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/config';
import Logging from './library/Logging';
import authRoutes from './routes/auth';
import scanRoutes from './routes/Scan';
import ticketsRoutes from './routes/tickets';
import adminActionsRoutes from './routes/adminActions';
import statsRoutes from './routes/Stats';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { initializeWebSocket } from './utils/WebSocketManager';

const router = express();

/** Connect to Mongo */
mongoose.set('strictQuery', false);
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('Mongo connected successfully.');
        StartServer();
    })
    .catch((error) => Logging.error(error));

/** Only Start Server if Mongoose Connects */
const StartServer = () => {
    /** Log the request */
    router.use((req, res, next) => {
        Logging.info(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

        res.on('finish', () => {
            Logging.info(`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`);
        });

        next();
    });

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());
    router.use(cookieParser());

    router.use((req, res, next) => {
        req.url = req.url.replace(/\/+/g, '/');
        next();
    });

    router.use(
        cors({
            origin: (origin, callback) => {
                callback(null, true);
            },
            credentials: true
        })
    );

    /** Swagger */
    router.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    /** Routes */
    router.use('/auth', authRoutes);
    router.use('/', adminActionsRoutes);
    router.use('/', scanRoutes);
    router.use('/', ticketsRoutes);
    router.use('/', statsRoutes);

    /** Healthcheck */
    router.get('/ping', (req, res, next) => res.status(200).json({ hello: 'world' }));

    /** Error handling */
    router.use((req, res, next) => {
        const error = new Error('Not found');

        Logging.error(error);

        res.status(404).json({
            message: error.message
        });
    });

    const httpServer = http.createServer(router);
    initializeWebSocket(httpServer);

    httpServer.listen(config.server.port, () => Logging.info(`Server is running on port ${config.server.port}`));
};
