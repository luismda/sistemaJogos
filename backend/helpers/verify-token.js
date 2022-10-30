import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
config()

const verifyToken = async (req, res, next) => {
    try {
        if (!req?.headers?.authorization) {
            res.status(401).json({ ok: false, message: 'Acesso negado.' })
            return
        }
    
        const token = req.headers.authorization.split(' ')[1]
    
        if (!token) {
            res.status(401).json({ ok: false, message: 'Acesso negado.' })
            return
        }
    
        const user = jwt.verify(token, process.env.SECRET)
        const usuarioExiste = await User.verificarSeUsuarioExiste('', user.id_usuario)

        if (!usuarioExiste) {
            res.status(401).json({ ok: false, message: 'Acesso negado.' })
            return
        }

        req.user = user
        next()
    } catch (error) {
        res.status(401).json({ ok: false, message: 'Acesso negado.' })
    }
}

export default verifyToken