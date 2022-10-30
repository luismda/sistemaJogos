import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

import { Context } from '../../context/UserContext'
import Navbar from '../layout/Navbar'
import BotaoFlutuante from '../layout/BotaoFlutuante'
import Input from '../layout/Input'
import Select from '../layout/Select'
import ModalPf from '../layout/ModalPf'
import Tabela from '../layout/Tabela'
import Loading from '../layout/Loading'
import Mensagem from '../layout/Mensagem'
import mask from '../../utils/mask'
import api from '../../utils/api'
import participantesConcursoStyles from '../../styles/components/ParticipantesConcurso.module.css'

function ParticipantesConcurso() {
    const { authenticated } = useContext(Context)
    const { id } = useParams()
    const [titleModalPf, setTitleModalPf] = useState('')
    const [showModalPf, setShowModalPf] = useState(false)
    const [visibleLoading, setVisibleLoading] = useState(false)
    const [mensagem, setMensagem] = useState({ type: '', msg: '' })
    const [pf, setPf] = useState({})
    const [participantes, setParticipantes] = useState([])
    const [concurso, setConcurso] = useState({})
    const [filtro, setFiltro] = useState({})
    const [cor, setCor] = useState('')
    const [optionsFiltroParticipantes] = useState([
        { value: 'todos', label: 'Todos' }, 
        { value: 'S', label: 'Participantes' }, 
        { value: 'N', label: 'Não participantes' }
    ])
    const [optionsFiltroStatus] = useState([
        { value: 'todos', label: 'Todos' }, 
        { value: 'Pago', label: 'Pago' }, 
        { value: 'Pendente', label: 'Pendente' }
    ])
    const navigate = useNavigate()

    useEffect(() => {
        if (!authenticated) {
            navigate('/login')
            return
        }

        setCor(window.location.pathname.split('/')[1] === 'lotofacil' ? 'roxo' : window.location.pathname.split('/')[1] === 'mega-sena' ? 'verde' : '')

        setVisibleLoading(true)

        getParticipantes()
    }, [authenticated, id, filtro, cor])

    const getParticipantes = () => {
        api.get(`/concurso/participantes/${id}?cotas=${filtro.cotas ? filtro.cotas : ''}&status=${filtro.status ? filtro.status : ''}&orderCol=${filtro.order?.col ? filtro.order.col : ''}&orderType=${filtro.order?.type ? filtro.order.type : ''}`).then(response => {
            setParticipantes(response.data.data.participantes.map(participante => ({ 
                ...participante, 
                shouldVisible: true,
                credito: mask(participante.credito ?? 0, 'dinheiro').replace('R$', '').trim(),
                deve: mask(participante.deve ?? 0, 'dinheiro').replace('R$', '').trim(),
                falta: mask(participante.falta ?? 0, 'dinheiro').replace('R$', '').trim(),
                pagamento: mask(participante.pagamento ?? 0, 'dinheiro').replace('R$', '').trim(),
                saldo: mask(participante.saldo ?? 0, 'dinheiro').replace('R$', '').trim()
            })))

            setConcurso(response.data.data.concurso)
            setVisibleLoading(false)
        }).catch(error => {
            setVisibleLoading(false)
        })
    }

    const handleChangeCotas = async ({ target }) => {
        const data = { id_concurso: id, id_pf: target.getAttribute('data'), cotas: parseInt(target.value) || parseInt(target.value) === 0 ? parseInt(target.value) : '' }

        setParticipantes(participantes.map(participante => ({
            ...participante,
            cotas: parseInt(participante.id_pf) === parseInt(data.id_pf) ? data.cotas : participante.cotas,
            status: parseInt(participante.id_pf) === parseInt(data.id_pf) ? participante.cotas === 0 ? 'Pendente' : data.cotas === 0 ? null : participante.status : participante.status,
            shouldVisible: participante.shouldVisible
        })))

        if (data.cotas !== '') {
            try {
                await api.patch('/concurso/participante/edit', data)

                await salvarCreditos(data.id_pf)
            } catch (error) {
                setVisibleLoading(false)
            }
        }
    }

    const handleChangeCreditos = ({ target }) => {
        setParticipantes(participantes.map(participante => ({
            ...participante,
            [target.name]: mask(parseInt(participante.id_pf) === parseInt(target.getAttribute('data')) 
                ? target.value 
                : participante[target.name] ?? 0, 'dinheiro').replace('R$', '').trim()
        })))
    }

    const salvarCreditos = async id_pf => {
        setVisibleLoading(true)

        let data = { id_concurso: id, id_pf: id_pf, credito: 0, deve: 0, pagamento: 0 }

        for(let i in participantes){
            if (parseInt(participantes[i].id_pf) === parseInt(data.id_pf)) {
                data.credito = participantes[i].credito ? parseFloat(participantes[i].credito.replace('.', '').replace(',', '.')) : 0
                data.deve = participantes[i].deve ? parseFloat(participantes[i].deve.replace('.', '').replace(',', '.')) : 0
                data.pagamento = participantes[i].pagamento ? parseFloat(participantes[i].pagamento.replace('.', '').replace(',', '.')) : 0

                break
            }
        }

        await api.patch('/concurso/participante/credito/edit', data)

        getParticipantes()
    }

    const handleSubmitCreditos = async e => {
        e.preventDefault()

        try {
            const id_pf = e.target.getAttribute('data')

            await salvarCreditos(id_pf)
        } catch (error) {
            setVisibleLoading(false)
        }
    }

    const handleChangeStatus = async ({ target }) => {
        const [id_pf, status] = target.getAttribute('data').split('|')

        const data = { id_concurso: id, id_pf, pago: status === 'pago' ? 'N' : 'S' }

        setParticipantes(participantes.map(participante => ({
            ...participante,
            status: parseInt(participante.id_pf) === parseInt(data.id_pf) ? data.pago === 'N' ? 'Pendente' : 'Pago' : participante.status,
            shouldVisible: participante.shouldVisible
        })))
        
        try {
            await api.patch('/concurso/participante/edit', data)
        } catch (error) {}
    }

    const handleChangeSelectFiltroParticipantes = ({ value }) => {
        setFiltro({ ...filtro, cotas: value === 'todos' ? '' : value })
    }

    const handleChangeSelectFiltroStatus = ({ value }) => {
        setFiltro({ ...filtro, status: value === 'todos' ? '' : value })
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

    const handleChangeSelectStatus = value => {
        setPf({ ...pf, status: value })
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
            complemento: pf.complemento ? pf.complemento?.map(({ value }) => value)?.join() : null
        }

        try {
            if (titleModalPf === 'Adicionar participante') {
                const { message, data } = await api.post('/pf/create', pfSalvar).then(response => response.data)
                await api.patch('/concurso/participante/edit', {
                    id_concurso: id,
                    id_pf: data.id_pf,
                    cotas: pf?.cotas ?? null,
                    pago: pf?.status ? pf?.status?.value === 'Pago' ? 'S' : 'N' : null 
                })

                setMensagem({ type: 'success', msg: message })
                setPf({})
                getParticipantes()
            } else {
                const { message } = await api.patch('/pf/edit', pfSalvar).then(response => response.data)
                await api.patch('/concurso/participante/edit', {
                    id_concurso: id,
                    id_pf: pf?.id_pf ?? null,
                    cotas: pf?.cotas ?? null,
                    pago: pf?.status ? pf?.status?.value === 'Pago' ? 'S' : 'N' : null 
                })

                setMensagem({ type: 'success', msg: message })
            
                getParticipantes()
            }
        } catch (error) {
            setMensagem({ type: 'error', msg: error.response.data.message })
            setVisibleLoading(false)
        }

        setTimeout(() => {
            setMensagem({ type: '', msg: '' })
        }, 5000)
    }

    const handleShowModalEditarPf = async id_pf => {
        setVisibleLoading(true)

        try {
            const participante = await api.get(`/pf/${id_pf}`).then(response => response.data)
            const cotas = await api.get(`/concurso/participante/${id}/${id_pf}`).then(response => response.data)

            setPf({ ...participante.data.pf, 
                cpf: mask(participante.data.pf.cpf, 'cpf'), 
                tel1: mask(participante.data.pf.tel1, 'tel'), 
                tel2: mask(participante.data.pf.tel2, 'tel'), 
                complemento: participante.data.pf.complemento?.split(',')?.map(comp => ({ value: comp, label: comp })) ?? null,
                cotas: cotas.data.participante.cotas ? cotas.data.participante.cotas : 0, 
                status: cotas.data.participante.status ? { value: cotas.data.participante.status, label: cotas.data.participante.status } : null
            })

            setVisibleLoading(false)
        } catch (error) {
            setVisibleLoading(false)
            setShowModalPf(true)

            setMensagem({ type: 'error', msg: 'Ocorreu um erro ao carregar o participante.' })

            setTimeout(() => {
                setMensagem({ type: '', msg: '' })
            }, 5000)
        }

        setTitleModalPf('Editar participante')
        setShowModalPf(true)
    }

    return (
        <div className='container-fluid px-0'>
            <Navbar cor={cor} />
            <h2 className={`ms-4 mt-4 ${cor}`}>Participantes <span className={participantesConcursoStyles.title_span}>({concurso?.tipo ? `${concurso.tipo} - ${concurso.numero} - ${concurso.data}` : ''})</span></h2>
            <div className='row w-100 m-0 d-flex justify-content-center align-items-center'>
                <div className={ `col-md ${participantesConcursoStyles.col_header}` }>
                    <Link 
                        className={`ms-2 ${participantesConcursoStyles.link_voltar} ${participantesConcursoStyles[cor]}`} 
                        to={ concurso?.tipo === 'Mega-sena' ? '/mega-sena' : '/lotofacil' }
                    >
                        <FaArrowLeft /> Voltar
                    </Link>
                </div>
                <div className={ `col-md d-flex justify-content-end align-items-center ${participantesConcursoStyles.col_header}` }>
                    <Select 
                        cor={cor}
                        type='normal'
                        placeholder='Participações'
                        isMulti={ false }
                        isSearchable={ false }
                        options={ optionsFiltroParticipantes }
                        defaultValue={ optionsFiltroParticipantes[0] }
                        onChange={ handleChangeSelectFiltroParticipantes }
                        className={ participantesConcursoStyles.select_filtro }
                    />
                    <Select 
                        cor={cor}
                        type='normal'
                        placeholder='Status'
                        isMulti={ false }
                        isSearchable={ false }
                        options={ optionsFiltroStatus }
                        defaultValue={ optionsFiltroStatus[0] }
                        onChange={ handleChangeSelectFiltroStatus }
                        className={ participantesConcursoStyles.select_filtro }
                    />
                    <span 
                        className='badge py-2 me-3' 
                        style={{
                            backgroundColor: parseInt(concurso?.contagem?.split('/')[0]) >= parseInt(concurso?.contagem?.split('/')[1]) ? '#dc3545' : cor === 'roxo' ? '#7144b9' : '#00a884'
                        }}>
                            {concurso.contagem}
                    </span>
                </div>
            </div>
            <div className='row w-100 m-0 d-flex justify-content-center align-items-center'>
                <div className='col-md-12 px-4'>
                    <Tabela 
                        cor={cor}
                        colunas={ ['CPF', 'Tel.', 'Nome', 'Cotas', 'Crédito', 'Deve', 'Falta', 'Pagamento', 'Saldo', 'Status', 'Nome da conta'] }
                        dados={ participantes }
                        propriedades={ ['cpf', 'tel', 'nome', 'cotas', 'credito', 'deve', 'falta', 'pagamento', 'saldo', 'status', 'complemento'] }
                        onChangeFuncs={{ handleChangeStatus, handleChangeCotas, handleChangeCreditos }}
                        onSubmitFuncs={{ handleSubmitCreditos }}
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
            <BotaoFlutuante cor={cor} onClick={ () => { 
                setTitleModalPf('Adicionar participante')
                setPf({})
                setShowModalPf(true) 
            } } />
            <ModalPf
                cor={cor}
                title={ titleModalPf }
                show={ showModalPf }
                onHide={ () => { setShowModalPf(false) } }
                onSubmit={ handleSubmit }
                onChangeFuncs={ { handleChangeInputs, handleChangeSelectComplemento } }
                inputValues={ pf }
            >
                <div className={participantesConcursoStyles.grid_group_form}>
                    <Input 
                        cor={cor}
                        name='cotas'
                        type='number'
                        placeholder='Cotas'
                        onChange={ handleChangeInputs }
                        value={ pf?.cotas || '' }
                    />
                    <Select 
                        cor={cor}
                        type='normal'
                        placeholder='Status'
                        isMulti={ false }
                        isSearchable={ false }
                        options={ [
                            { value: 'Pago', label: 'Pago' }, 
                            { value: 'Pendente', label: 'Pendente' }
                        ] }
                        value={ pf?.status || null }
                        onChange={ handleChangeSelectStatus }
                    />
                </div>
                {mensagem.msg && <Mensagem text={ mensagem.msg } type={ mensagem.type } />}
            </ModalPf>
            { visibleLoading && <Loading cor={cor} /> }
        </div>
    )
}

export default ParticipantesConcurso