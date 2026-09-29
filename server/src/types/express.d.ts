import type { Session } from "../lib/session.js";
import type { UserRole } from "../generated/prisma/client.js";

declare global {
    namespace Express {
        interface Request {
            session: Session;
            userRole?: UserRole;
        }
    }
}

export {};
