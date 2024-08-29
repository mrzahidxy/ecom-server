import { errorHandler } from './../exceptions/error-handler';
import { Router } from 'express';
import { login } from './../contrrollers/auth';
import { signup } from '../contrrollers/auth';



const authRoutes: Router = Router();

authRoutes.post('/signup', errorHandler(signup))
authRoutes.post('/login', login)

export default authRoutes 