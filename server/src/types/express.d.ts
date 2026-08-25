import { UserDocument } from "../models/Users.models.js";

declare global { 
    namespace Express { 
        interface User extends UserDocument {}
    }
}