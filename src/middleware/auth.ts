import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/jwt';
import { IJwtPayload, StaffRole } from '../models/JwtPayload';

export interface AuthRequest extends Request {
    staff?: IJwtPayload;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token requerido' });
    }

    try {
        req.staff = verifyAccessToken(token);
        return next();
    } catch (error: any) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Access token expirado' });
        }

        return res.status(401).json({ message: 'Token invalido' });
    }
};

export const authorizeRoles = (...roles: StaffRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.staff) {
            return res.status(401).json({ message: 'Staff no autenticado' });
        }

        if (!roles.includes(req.staff.role)) {
            return res.status(403).json({ message: 'No tienes permisos para ejecutar esta accion' });
        }

        return next();
    };
};
