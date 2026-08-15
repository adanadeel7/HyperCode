import { UserDocument } from "../models/Users.models";

declare global { 
    namespace Express { 
        interface Request { 
            user?: UserDocument;
        }
    }
}