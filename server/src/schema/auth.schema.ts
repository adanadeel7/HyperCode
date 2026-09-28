import {z} from "zod"

const registerSchema = z.object({
    email : z.string().email(),
    password : z.string().min(6), 
    name: z.string().min(3)
})

const loginSchema = z.object({
    email : z.string().email(), 
    password : z.string().min(6)
})

const forgotPasswordSchema = z.object({
    email : z.string().email()
})

const resetPasswordSechma = z.object({
    token : z.string().min(1),
    password : z.string().min(6)
})


export {registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSechma}