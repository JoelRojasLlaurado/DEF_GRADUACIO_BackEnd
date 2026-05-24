import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as ScanService from '../services/Scan';

const ALLOWED_LIMITS = new Set([10, 25, 50, 75, 100]);

const handleScanError = (error: unknown, res: Response) => {
    if (error instanceof ScanService.HttpError) {
        return res.status(error.status).json({ message: error.message });
    }

    return res.status(500).json({ error });
};

export const enter = async (req: AuthRequest, res: Response) => {
    try {
        const staffId = req.staff?.id;
        if (!staffId) {
            return res.status(401).json({ message: 'Staff no autenticado' });
        }

        const ticket = await ScanService.enter(req.body.hash, staffId);
        return res.status(200).json(ticket);
    } catch (error) {
        return handleScanError(error, res);
    }
};

export const verify = async (req: AuthRequest, res: Response) => {
    try {
        const staffId = req.staff?.id;
        if (!staffId) {
            return res.status(401).json({ message: 'Staff no autenticado' });
        }

        const ticket = await ScanService.verify(req.body.hash, staffId);
        return res.status(200).json(ticket);
    } catch (error) {
        return handleScanError(error, res);
    }
};

export const exit = async (req: AuthRequest, res: Response) => {
    try {
        const staffId = req.staff?.id;
        if (!staffId) {
            return res.status(401).json({ message: 'Staff no autenticado' });
        }

        const ticket = await ScanService.exit(req.body.hash, staffId);
        return res.status(200).json(ticket);
    } catch (error) {
        return handleScanError(error, res);
    }
};

export const history = async (req: AuthRequest, res: Response) => {
    try {
        const parsedLimit = Number(req.query.limit);
        const parsedPage = Number(req.query.page);
        const staffId = typeof req.query.staffId === 'string' ? req.query.staffId : undefined;

        const limit = (ALLOWED_LIMITS.has(parsedLimit) ? parsedLimit : 25) as ScanService.ScanHistoryLimit;
        const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

        const result = await ScanService.getHistory({ limit, page, staffId });
        return res.status(200).json(result);
    } catch (error) {
        return handleScanError(error, res);
    }
};
