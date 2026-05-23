import { Request, Response } from 'express';
import { getTicketStats } from '../services/Stats';

export const stats = async (_req: Request, res: Response) => {
    try {
        const data = await getTicketStats();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error });
    }
};
