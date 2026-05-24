import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import * as AdminActionsService from '../services/adminActions';

const handleAdminActionsError = (error: unknown, res: Response) => {
    return res.status(500).json({ error });
};

export const search = async (req: AuthRequest, res: Response) => {
    try {
        const q = typeof req.query.q === 'string' ? req.query.q : '';
        const parsedLimit = Number(req.query.limit);
        const parsedPage = Number(req.query.page);

        const limit = Number.isInteger(parsedLimit) && [10, 25, 50].includes(parsedLimit) ? parsedLimit : undefined;
        const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : undefined;

        const result = await AdminActionsService.search(q, { limit, page });

        return res.status(200).json(result);
    } catch (error) {
        return handleAdminActionsError(error, res);
    }
};

export const changeEnabled = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID de ticket inválido' });
        }

        const ticket = await AdminActionsService.changeEnabled(id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket no encontrado' });
        }

        return res.status(200).json(ticket);
    } catch (error) {
        return handleAdminActionsError(error, res);
    }
};