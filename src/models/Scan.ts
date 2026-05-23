import mongoose, { Document, Schema } from 'mongoose';

export type ScanAction = 'ENTER' | 'VERIFY' | 'EXIT' | 'ALREADY_USED' | 'NOT_USED';

export interface IScan {
    scan_id: string;
    action: ScanAction;
    hash: string;
    ticket_id: mongoose.Types.ObjectId;
    staff_id: mongoose.Types.ObjectId;
    time: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IScanModel extends IScan, Document {}

const ScanSchema: Schema = new Schema(
    {
        scan_id: { type: String, required: true, unique: true, index: true },
        action: { type: String, enum: ['ENTER', 'VERIFY', 'EXIT', 'ALREADY_USED', 'NOT_USED'], required: true },
        hash: { type: String, required: true, index: true },
        ticket_id: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
        staff_id: { type: Schema.Types.ObjectId, ref: 'Staff', required: true, index: true },
        time: { type: Date, required: true, default: Date.now }
    },
    {
        timestamps: true,
        versionKey: false,
        id: false
    }
);

export default mongoose.model<IScanModel>('Scan', ScanSchema);
