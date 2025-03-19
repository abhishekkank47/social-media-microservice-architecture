import express from 'express'
import { expresslimiter } from '../Middleweres/expressRateLimit.js'
import { loginController, logoutUserController, refreshTokenController, registerController } from '../Controllers/authController.js'


export const authRouter = express.Router()

//REGISTER
authRouter.post('/register', expresslimiter( 50 , 15 * 60 * 1000 ), registerController)

//LOGIN
authRouter.post('/login', expresslimiter( 50, 15 * 60* 1000), loginController)

//REFRESH TOKEN
authRouter.post('/refresh-token', refreshTokenController)

//LOGOUT
authRouter.post('/logout', logoutUserController)