import { Router } from 'express'
const router = Router()
import userController from '../controllers/userController.js'
import verifyToken from '../helpers/verify-token.js'

router.post('/create', userController.createUser)
router.post('/login', userController.loginUser)
router.patch('/edit', verifyToken, userController.editUser)
router.get('/', verifyToken, userController.getUser)

export default router