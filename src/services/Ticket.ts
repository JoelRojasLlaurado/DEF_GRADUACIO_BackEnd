import Ticket, { ITicketModel } from '../models/Ticket';

type TicketSearchResult = Pick<ITicketModel, '_id' | 'first_name' | 'last_name' | 'email' | 'ticket_type' | 'fac' | 'hash' | 'status' | 'consumed' | 'consume_time'>;
type TicketDetailResult = Pick<ITicketModel, '_id' | 'first_name' | 'last_name' | 'email' | 'ticket_type' | 'pmr' | 'hash' | 'fac' | 'local_number' | 'status' | 'consumed' | 'consume_time' | 'createdAt' | 'updatedAt'>;

const MAX_RESULTS = 10;

const buildSearchConditions = (query: string) => {
    const normalizedQuery = query.trim();
    const tokens = normalizedQuery
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean)
        .slice(0, 4);

    const escaped = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const conditions = [
        { first_name: { $regex: escaped, $options: 'i' } },
        { last_name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { fac: { $regex: escaped, $options: 'i' } },
        { hash: { $regex: escaped, $options: 'i' } }
    ];

    tokens.forEach((token) => {
        const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        conditions.push(
            { first_name: { $regex: escapedToken, $options: 'i' } },
            { last_name: { $regex: escapedToken, $options: 'i' } },
            { email: { $regex: escapedToken, $options: 'i' } },
            { fac: { $regex: escapedToken, $options: 'i' } },
            { hash: { $regex: escapedToken, $options: 'i' } }
        );
    });

    return conditions;
};

export const searchTickets = async (query: string, limit = MAX_RESULTS): Promise<TicketSearchResult[]> => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
        return [];
    }

    const searchLimit = Math.min(Math.max(limit, 1), MAX_RESULTS);
    const conditions = buildSearchConditions(trimmedQuery);

    const results = await Ticket.find({ $or: conditions })
        .sort({ consumed: 1, first_name: 1, last_name: 1, _id: -1 })
        .limit(searchLimit)
        .select('_id first_name last_name email ticket_type fac hash status consumed consume_time')
        .lean()
        .exec();

    return results as TicketSearchResult[];
};

export const getTicketByHash = async (hash: string): Promise<TicketDetailResult | null> => {
    const ticket = await Ticket.findOne({ hash })
        .select('_id first_name last_name email ticket_type pmr hash fac local_number status consumed consume_time createdAt updatedAt')
        .lean()
        .exec();

    return ticket as TicketDetailResult | null;
};
