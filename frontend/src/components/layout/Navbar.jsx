import { useEffect, useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Context } from '../../context/UserContext'
import ModalUsuario from './ModalUsuario'
import Loading from './Loading'
import Mensagem from './Mensagem'
import api from '../../utils/api'
import mask from '../../utils/mask'
import navbarStyles from '../../styles/components/Navbar.module.css'

function Navbar({ cor }) {
    const { authenticated, logout } = useContext(Context)
    const [page, setPage] = useState('')
    const [user, setUser] = useState({})
    const [username, setUsername] = useState('')
    const [showModalUsuario, setShowModalUsuario] = useState(false)
    const [visibleLoading, setVisibleLoading] = useState(false)
    const [mensagem, setMensagem] = useState({ type: '', msg: '' })
    const navigate = useNavigate()

    useEffect(() => {
        if (!authenticated) {
            navigate('/login')
            return
        }

        setPage(window.location.pathname.replace('/', ''))

        getUser()
    }, [authenticated, page])

    const getUser = () => {
        if (!user?.nome || !user?.cpf || !user?.email) {
            api.get('/user').then(response => {
                const usuario = response.data.data.usuario

                setUser({ ...usuario, 
                    cpf: mask(usuario.cpf, 'cpf'), 
                    tel1: mask(usuario.tel1, 'tel'), 
                    tel2: mask(usuario.tel2, 'tel'), 
                    complemento: usuario.complemento?.split(',')?.map(comp => ({ value: comp, label: comp })) ?? null
                })

                setUsername(usuario.nome.split(' ')[0])

                setVisibleLoading(false)
            }).catch(() => {
                setVisibleLoading(false)
            })

            return
        }

        setVisibleLoading(false)
    }

    const handleChangeInputs = ({ target }) => {
        const value = target.name === 'cpf' 
            ? mask(target.value, 'cpf') 
            : target.name.includes('tel') 
            ? mask(target.value, 'tel') 
            : target.value

        setUser({ ...user, [target.name]: value })

        if (target.name === 'cpf' && target.value.length === 14) {
            setVisibleLoading(true)

            api.get(`/pf/procob/${target.value.replace(/[^0-9]+/g, '')}`).then(({ data }) => {
                setUser({ ...user, cpf: value, nome: data?.data?.nome ?? '' })

                setVisibleLoading(false)
            }).catch(error => {
                setMensagem({ type: 'error', msg: error.response.data.message })
                setVisibleLoading(false)

                setTimeout(() => {
                    setMensagem({ type: '', msg: '' })
                }, 5000)
            })
        }
    }

    const handleChangeSelectComplemento = value => {
        setUser({ ...user, complemento: value })
    }

    const handleSubmit = async e => {
        e.preventDefault()

        setVisibleLoading(true)

        const userSalvar = {
            id_usuario: user?.id_usuario ?? null,
            id_pf: user?.id_pf ?? null,
            cpf: user?.cpf ?? null,
            nome: user?.nome ?? null,
            email: user?.email ?? null,
            tel1: user?.tel1 ?? null,
            tel2: user?.tel2 ?? null,
            complemento: user?.complemento?.map(({ value }) => value).join() ?? null,
            senha: user?.senha ?? null,
            nova_senha: user?.nova_senha ?? null
        }

        try {
            const { message } = await api.patch('/user/edit', userSalvar).then(response => response.data)
            setMensagem({ type: 'success', msg: message })

            setUsername(userSalvar.nome.split(' ')[0])
            setUser({ ...user, senha: null, nova_senha: null })

            setVisibleLoading(false)
        } catch (error) {
            setMensagem({ type: 'error', msg: error.response.data.message })
            setVisibleLoading(false)
        }

        setTimeout(() => {
            setMensagem({ type: '', msg: '' })
        }, 5000)
    }

    return (
        <>
            <nav className={ `navbar navbar-expand-md navbar-light ${navbarStyles.navbar} ${cor ? navbarStyles[cor] : ''}` }>
                <div className="container-fluid">
                    <button className={ `navbar-toggler mb-2 ${navbarStyles.toggler} ${navbarStyles[cor]}` } type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className={ `navbar-toggler-icon ${navbarStyles.toggler_icon}` }></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav w-100">
                            <li className={ `nav-item ${page === 'participantes' ? navbarStyles.active : ''}` }>
                                <Link to='/participantes' onClick={ () => { setPage('participantes') } } className='nav-link text-white px-2'>Participantes</Link>
                            </li>
                            <li className={ `nav-item ${page.includes('mega-sena') ? navbarStyles.active : ''}` }>
                                <Link to='/mega-sena' onClick={ () => { setPage('mega-sena') } } className='nav-link text-white px-2'>Mega-sena</Link>
                            </li>
                            <li className={ `nav-item me-auto ${page.includes('lotofacil') ? navbarStyles.active : ''}` }>
                                <Link to='/lotofacil' onClick={ () => { setPage('lotofacil') } } className='nav-link text-white px-2'>Lotofácil</Link>
                            </li>
                            <li className="nav-item dropdown">
                                <Link 
                                    className={`nav-link dropdown-toggle text-white px-2 ${navbarStyles.nav_item_link_user}`} 
                                    data-bs-toggle="dropdown" 
                                    aria-expanded="false"
                                >
                                    {username}
                                </Link>
                                <ul className="dropdown-menu dropdown-menu-end m-0">
                                    <li><Link className={`dropdown-item ${cor}`} onClick={ () => { 
                                        setShowModalUsuario(true) 
                                        setVisibleLoading(true)
                                        getUser()
                                    } }
                                    >
                                        Meu perfil
                                    </Link></li>
                                    <li><Link className={`dropdown-item ${cor}`} to='/login' onClick={ () => { logout() } }>Sair</Link></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <ModalUsuario
                cor={cor}
                title='Meu perfil'
                show={ showModalUsuario }
                onHide={ () => { setShowModalUsuario(false) } }
                onSubmit={ handleSubmit }
                onChangeFuncs={ { handleChangeInputs, handleChangeSelectComplemento } }
                inputValues={ user }
            >
                {mensagem.msg && <Mensagem text={ mensagem.msg } type={ mensagem.type } />}
            </ModalUsuario>
            { visibleLoading && <Loading /> }
        </>
    )
}

export default Navbar