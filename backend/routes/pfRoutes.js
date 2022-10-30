import { Router } from 'express'
const router = Router()
import pfController from '../controllers/pfController.js'
import verifyToken from '../helpers/verify-token.js'

router.post('/create', verifyToken, pfController.createPf)
router.patch('/edit', verifyToken, pfController.editPf)
router.get('/all', verifyToken, pfController.getPfs)
router.get('/procob/:cpf', verifyToken, pfController.getDadosProcobPf)
router.get('/:id', verifyToken, pfController.getPf)

export default router