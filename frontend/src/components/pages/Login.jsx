import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import { Context } from '../../context/UserContext'
import Input from '../layout/Input'
import Loading from '../layout/Loading'
import Mensagem from '../layout/Mensagem'
import loginStyles from '../../styles/components/Login.module.css'

function Login() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const { authenticated, login } = useContext(Context)
    const [visibleLoading, setVisibleLoading] = useState(false)
    const [mensagem, setMensagem] = useState({ type: '', msg: '' })
    const navigate = useNavigate()

    useEffect(() => {
        if (authenticated) {
            navigate('/participantes')
        }
    }, [authenticated])

    const handleSubmit = async e => {
        e.preventDefault()

        if (email && senha) {
            setVisibleLoading(true)

            const { type, msg } = await login({ email, senha })

            setVisibleLoading(false)

            if (type === 'error') {
                setMensagem({ type: 'error', msg })

                setTimeout(() => {
                    setMensagem({ type: '', msg: '' })
                }, 5000)
            }
        }
    }

    return (
        <div className={ `container-fluid d-flex align-items-center justify-content-center ${loginStyles.container}` }>
            <div className="row w-100 d-flex justify-content-center">
                <div className="col-md-4">
                    <div className="card">
                        <h2>Entrar</h2>
                        <form onSubmit={ handleSubmit }>
                            <Input 
                                name='email'
                                type='email'
                                placeholder='E-mail'
                                onChange={ ({ target }) => { setEmail(target.value) } }
                                value={ email }
                            />
                            <Input 
                                name='senha'
                                type='password'
                                placeholder='Senha'
                                onChange={ ({ target }) => { setSenha(target.value) } }
                                value={ senha }
                            />
                            {mensagem.msg && <Mensagem text={ mensagem.msg } type={ mensagem.type } />}
                            <button type='submit' className={ `btn ${loginStyles.btn}` }>Entrar</button>
                        </form>
                    </div>
                </div>
            </div>
            { visibleLoading && <Loading /> }
        </div>
    )
}

export default Login