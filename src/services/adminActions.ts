import Ticket, { ITicketModel } from '../models/Ticket';

type AdminSearchResult = Pick<ITicketModel, '_id' | 'first_name' | 'last_name' | 'email' | 'ticket_type' | 'fac' | 'hash' | 'status' | 'consumed' | 'consume_time' | 'pmr' | 'local_number'>;

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
        { fac: { $regex: escaped, $options: 'i' } }
    ];

    tokens.forEach((token) => {
        const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        conditions.push(
            { first_name: { $regex: escapedToken, $options: 'i' } },
            { last_name: { $regex: escapedToken, $options: 'i' } },
            { email: { $regex: escapedToken, $options: 'i' } },
            { fac: { $regex: escapedToken, $options: 'i' } }
        );
    });

    return conditions;
};

type SearchOptions = {
    limit?: number;
    page?: number;
};

type SearchResult = {
    data: AdminSearchResult[];
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
};

export const search = async (query: string, options: SearchOptions = {}): Promise<SearchResult> => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
        return { data: [], total: 0 };
    }

    const { limit, page } = options;

    const conditions = buildSearchConditions(trimmedQuery);

    const filter = { $or: conditions };

    if (typeof page === 'number' && Number.isInteger(page) && page > 0) {
        const pageLimit = typeof limit === 'number' && [10, 25, 50].includes(limit) ? limit : 10;
        const skip = (page - 1) * pageLimit;

        const [data, total] = await Promise.all([
            Ticket.find(filter)
                .sort({ consumed: 1, first_name: 1, last_name: 1, _id: -1 })
                .skip(skip)
                .limit(pageLimit)
                .select('_id first_name last_name email ticket_type fac hash status consumed consume_time pmr local_number')
                .lean()
                .exec(),
            Ticket.countDocuments(filter)
        ]);

        return {
            data: data as AdminSearchResult[],
            total,
            page,
            limit: pageLimit,
            totalPages: Math.max(1, Math.ceil(total / pageLimit))
        };
    }

    // No pagination: return all (or limited if limit provided)
    const q = Ticket.find(filter)
        .sort({ consumed: 1, first_name: 1, last_name: 1, _id: -1 })
        .select('_id first_name last_name email ticket_type fac hash status consumed consume_time pmr local_number')
        .lean();

    if (typeof limit === 'number' && [10, 25, 50].includes(limit)) {
        q.limit(limit);
    }

    const data = await q.exec();
    return { data: data as AdminSearchResult[], total: data.length, limit };
};