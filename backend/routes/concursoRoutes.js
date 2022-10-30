import { Router } from 'express'
const router = Router()
import concursoController from '../controllers/concursoController.js'
import verifyToken from '../helpers/verify-token.js'

router.post('/create', verifyToken, concursoController.createConcurso)
router.patch('/edit', verifyToken, concursoController.editConcurso)
router.patch('/participante/edit', verifyToken, concursoController.editParticipante)
router.patch('/participante/credito/edit', verifyToken, concursoController.editCreditoParticipante)
router.get('/all', verifyToken, concursoController.getConcursos)
router.get('/participantes/home/:tipo', concursoController.getParticipantesHome)
router.get('/participantes/:id', verifyToken, concursoController.getParticipantesConcurso)
router.get('/participante/:id_concurso/:id_pf', verifyToken, concursoController.getParticipante)
router.get('/:id', verifyToken, concursoController.getConcurso)

export default router