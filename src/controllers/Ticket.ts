import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as TicketService from '../services/Ticket';

const handleTicketError = (error: unknown, res: Response) => {
    return res.status(500).json({ error });
};

export const search = async (req: AuthRequest, res: Response) => {
    try {
        const q = typeof req.query.q === 'string' ? req.query.q : '';
        const parsedLimit = Number(req.query.limit);
        const limit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;

        const data = await TicketService.searchTickets(q, limit);
        return res.status(200).json({ data, total: data.length });
    } catch (error) {
        return handleTicketError(error, res);
    }
};

export const getByHash = async (req: AuthRequest, res: Response) => {
    try {
        const hash = typeof req.params.hash === 'string' ? req.params.hash : '';
        const ticket = await TicketService.getTicketByHash(hash);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket no encontrado' });
        }

        return res.status(200).json(ticket);
    } catch (error) {
        return handleTicketError(error, res);
    }
};
