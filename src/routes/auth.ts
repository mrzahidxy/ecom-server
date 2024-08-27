import { Router } from 'express';
import { login } from './../contrrollers/auth';
import { signup } from '../contrrollers/auth';



const authRoutes: Router = Router();

authRoutes.post('/signup', signup)
authRoutes.post('/login', login)

export default authRoutes 