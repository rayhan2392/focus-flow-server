import type { User, WorkspaceMember } from "../../generated/client/browser.js";

export type AuthUser = Pick<User, "id" | "email" | "name">;

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser
            membership?: WorkspaceMember
        }
    }
}