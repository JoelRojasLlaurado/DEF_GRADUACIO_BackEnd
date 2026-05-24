import mongoose from 'mongoose';
import Ticket from '../models/Ticket';
import Scan, { ScanAction } from '../models/Scan';
import { broadcastScanEvent } from '../utils/WebSocketManager';

type ScanHistoryLimit = 10 | 25 | 50 | 75 | 100;

type ScanHistoryPagination = {
    limit: ScanHistoryLimit;
    page: number;
    staffId?: string;
};

type ScanHistoryResult<T> = {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

class HttpError extends Error {
    public readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

const registerScan = async (action: ScanAction, hash: string, staffId: string, ticketId: mongoose.Types.ObjectId) => {
    const scan = await Scan.create({
        scan_id: new mongoose.Types.ObjectId().toString(),
        action,
        hash,
        staff_id: new mongoose.Types.ObjectId(staffId),
        ticket_id: ticketId,
        time: new Date()
    });

    // Populate and broadcast event to admins
    const populatedScan = await scan.populate('ticket_id', 'first_name last_name email ticket_type pmr hash consumed consume_time fac local_number');
    const populatedWithStaff = await populatedScan.populate('staff_id', 'email first_name last_name role');

    broadcastScanEvent({
        scan_id: scan.scan_id,
        action: scan.action,
        hash: scan.hash,
        time: scan.time,
        ticket: populatedWithStaff.ticket_id,
        staff: populatedWithStaff.staff_id
    });
};

const findTicketByHash = async (hash: string) => {
    const ticket = await Ticket.findOne({ hash }).exec();

    if (!ticket) {
        throw new HttpError(404, 'Ticket no encontrado');
    }

    return ticket;
};

const assertTicketEnabled = (ticket: { status: string }) => {
    if (ticket.status === 'disabled') {
        throw new HttpError(409, 'La entrada esta desactivada y no puede utilizarse');
    }
};

const enter = async (hash: string, staffId: string) => {
    const ticket = await findTicketByHash(hash);

    assertTicketEnabled(ticket);

    if (ticket.consumed) {
        await registerScan('ALREADY_USED', hash, staffId, ticket._id);
        throw new HttpError(409, 'El ticket ya fue consumido previamente');
    }

    ticket.consumed = true;
    ticket.consume_time = new Date();
    await ticket.save();

    await registerScan('ENTER', hash, staffId, ticket._id);

    return ticket;
};

const verify = async (hash: string, staffId: string) => {
    const ticket = await findTicketByHash(hash);
    await registerScan('VERIFY', hash, staffId, ticket._id);
    return ticket;
};

const exit = async (hash: string, staffId: string) => {
    const ticket = await findTicketByHash(hash);

    assertTicketEnabled(ticket);

    if (!ticket.consumed) {
        await registerScan('NOT_USED', hash, staffId, ticket._id);
        throw new HttpError(409, 'No se puede hacer exit: el ticket no estaba consumido');
    }

    ticket.consumed = false;
    ticket.consume_time = null;
    await ticket.save();

    await registerScan('EXIT', hash, staffId, ticket._id);

    return ticket;
};

const getHistory = async (pagination: ScanHistoryPagination): Promise<ScanHistoryResult<any>> => {
    const { limit, page, staffId } = pagination;
    const skip = (page - 1) * limit;
    const filter = staffId ? { staff_id: new mongoose.Types.ObjectId(staffId) } : {};

    const [data, total] = await Promise.all([
        Scan.find(filter)
            .populate('ticket_id', 'first_name last_name email ticket_type pmr hash consumed consume_time fac local_number')
            .populate('staff_id', 'email first_name last_name role')
            .sort({ time: -1, _id: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),
        Scan.countDocuments(filter)
    ]);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit))
        }
    };
};

export { HttpError, enter, verify, exit, getHistory, ScanHistoryLimit };
