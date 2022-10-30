import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
config()

import userRoutes from './routes/userRoutes.js'
import pfRoutes from './routes/pfRoutes.js'
import concursoRoutes from './routes/concursoRoutes.js'

const app = express()

app.use(express.json())
app.use(cors({
    credentials: true,
    origin: "*"
}))
app.use('/user', userRoutes)
app.use('/pf', pfRoutes)
app.use('/concurso', concursoRoutes)

export default app