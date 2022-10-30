import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
config()

const createToken = id_usuario => jwt.sign({ id_usuario }, process.env.SECRET)

export default createToken