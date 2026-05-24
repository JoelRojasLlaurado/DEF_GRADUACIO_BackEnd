import Joi, { ObjectSchema } from 'joi';
import { NextFunction, Request, Response } from 'express';
import Logging from '../library/Logging';

export const ValidateJoi = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body);
            next();
        } catch (error) {
            Logging.error(error);
            return res.status(422).json({ error });
        }
    };
};

export const ValidateQuery = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.query);
            next();
        } catch (error) {
            Logging.error(error);
            return res.status(422).json({ error });
        }
    };
};

export const Schemas = {
    Auth: {
        login: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required()
        }),
        createStaff: Joi.object({
            first_name: Joi.string().trim().required(),
            last_name: Joi.string().trim().required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            role: Joi.string().valid('admin', 'moderator', 'desk').required(),
            position: Joi.string().trim().required(),
            enabled: Joi.boolean().optional()
        }),
        updateStaffEnabled: Joi.object({
            enabled: Joi.boolean().required()
        })
    },

    Scan: {
        action: Joi.object({
            hash: Joi.string().min(10).required()
        }),
        listQuery: Joi.object({
            limit: Joi.number().valid(10, 25, 50, 75, 100).optional(),
            page: Joi.number().integer().min(1).optional(),
            staffId: Joi.string().hex().length(24).optional()
        }).optional()
    },

    Tickets: {
        searchQuery: Joi.object({
            q: Joi.string().trim().min(1).required(),
            limit: Joi.number().integer().min(1).max(10).optional()
        })
    },

    AdminActions: {
        searchQuery: Joi.object({
            q: Joi.string().trim().min(1).required(),
            limit: Joi.number().valid(10, 25, 50).optional(),
            page: Joi.number().integer().min(1).optional()
        })
    }
};