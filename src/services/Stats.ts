import Ticket from '../models/Ticket';

type TicketTypeKey = '0' | '1' | '2' | '3' | '4';

export type TicketStatsResponse = {
    total_tickets: number;
    used_tickets: number;
    by_ticket_type: Record<TicketTypeKey, { total: number; used: number }>;
};

const EMPTY_BY_TYPE: Record<TicketTypeKey, { total: number; used: number }> = {
    '0': { total: 0, used: 0 },
    '1': { total: 0, used: 0 },
    '2': { total: 0, used: 0 },
    '3': { total: 0, used: 0 },
    '4': { total: 0, used: 0 }
};

const getTicketStats = async (): Promise<TicketStatsResponse> => {
    const [overall, byType] = await Promise.all([
        Ticket.aggregate([
            {
                $group: {
                    _id: null,
                    total_tickets: { $sum: 1 },
                    used_tickets: {
                        $sum: {
                            $cond: [{ $eq: ['$consumed', true] }, 1, 0]
                        }
                    }
                }
            }
        ]),
        Ticket.aggregate([
            {
                $group: {
                    _id: '$ticket_type',
                    total: { $sum: 1 },
                    used: {
                        $sum: {
                            $cond: [{ $eq: ['$consumed', true] }, 1, 0]
                        }
                    }
                }
            }
        ])
    ]);

    const by_ticket_type = { ...EMPTY_BY_TYPE };

    byType.forEach((row: { _id: number; total: number; used: number }) => {
        const key = String(row._id) as TicketTypeKey;
        if (key in by_ticket_type) {
            by_ticket_type[key] = {
                total: row.total,
                used: row.used
            };
        }
    });

    const summary = overall[0] || { total_tickets: 0, used_tickets: 0 };

    return {
        total_tickets: summary.total_tickets,
        used_tickets: summary.used_tickets,
        by_ticket_type
    };
};

export { getTicketStats };
