import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import { Context } from '../../context/UserContext'
import Navbar from '../layout/Navbar'
import BotaoFlutuante from '../layout/BotaoFlutuante'
import ModalPf from '../layout/ModalPf'
import Tabela from '../layout/Tabela'
import Loading from '../layout/Loading'
import Mensagem from '../layout/Mensagem'
import mask from '../../utils/mask'
import api from '../../utils/api'

function Participantes() {
    const { authenticated } = useContext(Context)
    const [titleModalPf, setTitleModalPf] = useState('')
    const [showModalPf, setShowModalPf] = useState(false)
    const [visibleLoading, setVisibleLoading] = useState(false)
    const [mensagem, setMensagem] = useState({ type: '', msg: '' })
    const [pf, setPf] = useState({})
    const [pfs, setPfs] = useState([])
    const [filtro, setFiltro] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
        if (!authenticated) {
            navigate('/login')
            return
        }

        setVisibleLoading(true)
        getPfs()
    }, [authenticated, filtro])

    const getPfs = () => {
        api.get(`/pf/all?orderCol=${filtro.order?.col ? filtro.order.col : ''}&orderType=${filtro.order?.type ? filtro.order.type : ''}`).then(response => {
            setPfs(response.data.data.pfs)
            setVisibleLoading(false)
        }).catch(error => {
            setVisibleLoading(false)
        })
    }

    const handleChangeInputs = ({ target }) => {
        const value = target.name === 'cpf' 
            ? mask(target.value, 'cpf') 
            : target.name.includes('tel') 
            ? mask(target.value, 'tel') 
            : target.value

        setPf({ ...pf, [target.name]: value })

        if (target.name === 'cpf' && target.value.length === 14) {
            setVisibleLoading(true)

            api.get(`/pf/procob/${target.value.replace(/[^0-9]+/g, '')}`).then(({ data }) => {
                setPf({ ...pf, cpf: value, nome: data?.data?.nome ?? '' })

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
        setPf({ ...pf, complemento: value })
    }

    const handleSubmit = async e => {
        e.preventDefault()

        setVisibleLoading(true)

        const pfSalvar = {
            id_pf: pf.id_pf ? pf.id_pf : null,
            cpf: pf.cpf ? pf.cpf : null,
            nome: pf.nome ? pf.nome : null,
            email: pf.email ? pf.email : null,
            tel1: pf.tel1 ? pf.tel1 : null,
            tel2: pf.tel2 ? pf.tel2 : null,
            complemento: pf.complemento ? pf.complemento.map(({ value }) => value).join() : null
        }

        try {
            if (titleModalPf === 'Adicionar participante') {
                const { message } = await api.post('/pf/create', pfSalvar).then(response => response.data)
                setMensagem({ type: 'success', msg: message })
                setPf({})
                getPfs()
            } else {
                const { message } = await api.patch('/pf/edit', pfSalvar).then(response => response.data)
                setMensagem({ type: 'success', msg: message })
            
                getPfs()
            }
        } catch (error) {
            setMensagem({ type: 'error', msg: error.response.data.message })
            setVisibleLoading(false)
        }

        setTimeout(() => {
            setMensagem({ type: '', msg: '' })
        }, 5000)
    }

    const handleShowModalEditarPf = id_pf => {
        setVisibleLoading(true)

        api.get(`/pf/${id_pf}`).then(response => {
            const pf = response.data.data.pf
            
            setPf({ ...pf, 
                cpf: mask(pf.cpf, 'cpf'), 
                tel1: mask(pf.tel1, 'tel'), 
                tel2: mask(pf.tel2, 'tel'), 
                complemento: pf.complemento?.split(',')?.map(comp => ({ value: comp, label: comp })) ?? null
            })

            setVisibleLoading(false)
        }).catch(error => {
            setVisibleLoading(false)
            setShowModalPf(true)

            setMensagem({ type: 'error', msg: 'Ocorreu um erro ao carregar o participante.' })

            setTimeout(() => {
                setMensagem({ type: '', msg: '' })
            }, 5000)
        })

        setTitleModalPf('Editar participante')
        setShowModalPf(true)
    }

    return (
        <div className='container-fluid px-0'>
            <Navbar />
            <h2 className='ms-4 mt-4'>Participantes</h2>
            <div className='row w-100 m-0 d-flex justify-content-center align-items-center'>
                <div className='col-md-12 px-4'>
                    <Tabela 
                        colunas={ ['CPF', 'Tel.', 'Nome', 'Nome da conta'] }
                        dados={ pfs }
                        propriedades={ ['cpf', 'tel', 'nome', 'complemento'] }
                        dropdown={ true }
                        options={ [{ 
                            item: 'Editar', 
                            action: ({ target }) => {
                                handleShowModalEditarPf(target.getAttribute('data'))
                            } 
                        }] }
                        contagem
                        ordenacao={order => setFiltro({ ...filtro, order })}
                        fixedHeader
                    />
                </div>
            </div>
            <BotaoFlutuante onClick={ () => { 
                setTitleModalPf('Adicionar participante')
                setPf({})
                setShowModalPf(true) 
            } } />
            <ModalPf
                title={ titleModalPf }
                show={ showModalPf }
                onHide={ () => { setShowModalPf(false) } }
                onSubmit={ handleSubmit }
                onChangeFuncs={ { handleChangeInputs, handleChangeSelectComplemento } }
                inputValues={ pf }
            >
                {mensagem.msg && <Mensagem text={ mensagem.msg } type={ mensagem.type } />}
            </ModalPf>
            { visibleLoading && <Loading /> }
        </div>
    )
}

export default Participantes