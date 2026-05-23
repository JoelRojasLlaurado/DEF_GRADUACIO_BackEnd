export type StaffRole = 'admin' | 'moderator' | 'desk';

export interface IJwtPayload {
    id: string;
    email: string;
    role: StaffRole;
    first_name: string;
    last_name: string;
}