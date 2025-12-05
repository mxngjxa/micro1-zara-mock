import { Interview } from './interview.entity';
export declare class User {
    id: string;
    email: string;
    password_hash: string;
    email_verified: boolean;
    verification_token: string;
    reset_token: string;
    reset_token_expires: Date;
    created_at: Date;
    updated_at: Date;
    last_login: Date;
    interviews: Interview[];
}
