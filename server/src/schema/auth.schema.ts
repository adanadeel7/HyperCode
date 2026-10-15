import {z} from "zod"

const registerSchema = z.object({
    email : z.string().email("Invalid email address"),
    password : z.string().min(6, "Password must be at least 6 characters"), 
    name: z.string().min(2, "Name must be at least 2 characters")
})

const loginSchema = z.object({
    email : z.string().email("Invalid email address"), 
    password : z.string().min(6, "Password must be at least 6 characters")
})

const forgotPasswordSchema = z.object({
    email : z.string().email()
})

const resetPasswordSechma = z.object({
    token : z.string().min(1),
    password : z.string().min(6)
})


export {registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSechma}