import mongoose, { Document, Schema } from 'mongoose';

export type TicketType = 0 | 1 | 2 | 3 | 4;
export type TicketStatus = 'enabled' | 'disabled';

export interface ITicket {
    first_name: string;
    last_name: string;
    email: string;
    ticket_type: TicketType;
    pmr: boolean;
    hash: string;
    fac: string;
    local_number: number;
    consumed: boolean;
    consume_time: Date | null;
    status: TicketStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITicketModel extends ITicket, Document {}

const TicketSchema: Schema = new Schema(
    {
        first_name: { type: String, required: true, trim: true },
        last_name: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        ticket_type: { type: Number, enum: [0, 1, 2, 3, 4], required: true },
        pmr: { type: Boolean, required: true },
        hash: { type: String, required: true, unique: true, index: true },
        fac: { type: String, required: true, unique: true, index: true },
        local_number: { type: Number, required: true, min: 0 },
        consumed: { type: Boolean, default: false },
        consume_time: { type: Date, default: null }
        ,
        status: { type: String, enum: ['enabled', 'disabled'], default: 'enabled' }
    },
    {
        timestamps: true,
        versionKey: false,
        id: false
    }
);

export default mongoose.model<ITicketModel>('Ticket', TicketSchema);
