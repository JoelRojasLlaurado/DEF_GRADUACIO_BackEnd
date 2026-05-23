import swaggerJSDoc, { Options } from 'swagger-jsdoc';
import path from 'path';
import { config } from './config/config';

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Graduation Ticket Scan API',
            version: '1.0.0',
            description: 'Backend API for ticket validation and scan tracking'
        },
        servers: [
            {
                url: `http://localhost:${config.server.port}`
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },

    apis: [path.join(__dirname, 'routes', '*.js')]
};

export const swaggerSpec = swaggerJSDoc(options);