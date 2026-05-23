import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { StaffRole } from './JwtPayload';

export interface IStaff {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: StaffRole;
    position: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IStaffModel extends IStaff, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const StaffSchema: Schema = new Schema(
    {
        first_name: { type: String, required: true, trim: true },
        last_name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ['admin', 'moderator', 'desk'],
            required: true
        },
        position: { type: String, required: true, trim: true },
        enabled: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'staff',
        id: false,
        toJSON: {
            virtuals: true,
            transform: function (_doc, ret) {
                delete ret.password;
                return ret;
            }
        },
        toObject: {
            virtuals: true
        }
    }
);

StaffSchema.pre('save', async function (next) {
    const staff = this as IStaffModel;

    if (!staff.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        staff.password = await bcrypt.hash(staff.password, salt);
        return next();
    } catch (error) {
        return next(error as Error);
    }
});

StaffSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IStaffModel>('Staff', StaffSchema);
