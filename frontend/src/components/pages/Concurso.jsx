import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import { Context } from '../../context/UserContext'
import Navbar from '../layout/Navbar'
import Tabela from '../layout/Tabela'
import ModalConcurso from '../layout/ModalConcurso'
import Loading from '../layout/Loading'
import Mensagem from '../layout/Mensagem'
import BotaoFlutuante from '../layout/BotaoFlutuante'
import mask from '../../utils/mask'
import api from '../../utils/api'

function Concurso({ title }) {
    const { authenticated } = useContext(Context)
    const navigate = useNavigate()
    const [visibleLoading, setVisibleLoading] = useState(false)
    const [mensagem, setMensagem] = useState({ type: '', msg: '' })
    const [titleModalConcurso, setTitleModalConcurso] = useState('')
    const [modalConcursoShow, setModalConcursoShow] = useState(false)
    const [concursos, setConcursos] = useState([])
    const [concurso, setConcurso] = useState({})
    const [filtro, setFiltro] = useState({})
    const [cor, setCor] = useState('')

    useEffect(() => {
        if (!authenticated) {
            navigate('/login')
            return
        }

        setCor(title === 'Lotofácil' ? 'roxo' : title === 'Mega-sena' ? 'verde' : '')

        setVisibleLoading(true)

        getConcursos()
    }, [authenticated, title, filtro, cor])

    const getConcursos = () => {
        api.get(`/concurso/all?tipo=${title}&orderCol=${filtro.order?.col ? filtro.order.col : ''}&orderType=${filtro.order?.type ? filtro.order.type : ''}`).then(response => {
            setConcursos(response.data.data.concursos)

            setVisibleLoading(false)
        }).catch(error => {
            setVisibleLoading(false)
        })
    }

    const handleChangeSelectStatus = value => {
        setConcurso({ ...concurso, status: value })
    }

    const handleChangeConcurso = ({ target }) => {
        const value = target.name === 'data'
            ? mask(target.value, 'data')
            : target.name === 'premio' || target.name === 'premio_ganho' || target.name === 'valor_cota'
            ? mask(target.value, 'dinheiro')
            : target.value

        setConcurso({ ...concurso, [target.name]: value })
    }

    const handleOnSubmitConcurso = async e => {
        e.preventDefault()

        setVisibleLoading(true)

        const concursoSalvar = {
            id_concurso: concurso.id_concurso ? concurso.id_concurso : null,
            numero: concurso.numero ? concurso.numero : null,
            data: concurso.data ? concurso.data : null,
            tipo: title,
            premio: concurso.premio ? parseFloat(concurso?.premio?.replace('R$', '')?.replace(/\./g, '')?.replace(',', '.')?.trim()) : null,
            total_cotas: concurso.total_cotas ? concurso.total_cotas : null,
            valor_cota: concurso.valor_cota ? parseFloat(concurso?.valor_cota?.replace('R$', '')?.replace(/\./g, '')?.replace(',', '.')?.trim()) : null,
            status: concurso.status?.value ? concurso.status.value : null,
            premio_ganho: concurso.premio_ganho ? parseFloat(concurso?.premio_ganho?.replace('R$', '')?.replace(/\./g, '')?.replace(',', '.')?.trim()) : null,
            informacao: concurso.informacao ? concurso.informacao : null
        }

        try {
            if (titleModalConcurso === 'Adicionar concurso') {
                const { message } = await api.post('/concurso/create', concursoSalvar).then(response => response.data)
                setConcurso({})
                getConcursos()
    
                setMensagem({ type: 'success', msg: message })
            } else {
                const { message } = await api.patch('/concurso/edit', concursoSalvar).then(response => response.data)
                getConcursos()
                
                setMensagem({ type: 'success', msg: message })
            }
        } catch (error) {
            setMensagem({ type: 'error', msg: error.response.data.message })
            setVisibleLoading(false)
        }

        setTimeout(() => {
            setMensagem({ type: '', msg: '' })
        }, 5000)
    }

    const handleShowModalEditarConcurso = id_concurso => {
        setVisibleLoading(true)

        api.get(`/concurso/${id_concurso}`).then(response => {
            const concurso = response.data.data.concurso
            
            setConcurso({ ...concurso, 
                premio: concurso?.premio ? mask(concurso?.premio, 'dinheiro') : '', 
                premio_ganho: concurso?.premio_ganho ? mask(concurso?.premio_ganho, 'dinheiro') : '', 
                valor_cota: concurso?.valor_cota ? mask(concurso?.valor_cota, 'dinheiro') : '',
                status: { value: concurso.status, label: concurso.status } 
            })

            setVisibleLoading(false)
        }).catch(error => {
            setVisibleLoading(false)
            setModalConcursoShow(true)

            setMensagem({ type: 'error', msg: 'Ocorreu um erro ao carregar o concurso.' })

            setTimeout(() => {
                setMensagem({ type: '', msg: '' })
            }, 5000)
        })

        setTitleModalConcurso('Editar concurso')
        setModalConcursoShow(true)
    }

    return (
        <div className='container-fluid px-0'>
            <Navbar cor={cor} />
            <h2 className={`ms-4 mt-4 ${cor}`}>{ title }</h2>
            <div className='row w-100 m-0 d-flex justify-content-center align-items-center'>
                <div className='col-md-12 px-4'>
                    <Tabela 
                        cor={cor}
                        colunas={ ['Data', 'Concurso', 'Prêmio', 'Cotas', 'Valor', 'Cont.', 'Status'] }
                        dados={ concursos }
                        propriedades={ ['data', 'numero', 'premio', 'total_cotas', 'valor_cota', 'contagem', 'status'] }
                        contagem
                        dropdown={ true }
                        options={ [{ 
                            item: 'Editar', 
                            action: ({ target }) => {
                                handleShowModalEditarConcurso(target.getAttribute('data'))
                            } 
                        }, 
                        { 
                            item: 'Participantes', 
                            action: ({ target }) => { 
                                navigate(`/${title === 'Mega-sena' ? 'mega-sena' : 'lotofacil'}/participantes/${target.getAttribute('data')}`) 
                            } 
                        }] }
                        ordenacao={order => setFiltro({ ...filtro, order })}
                        fixedHeader
                    />
                </div>
            </div>
            <BotaoFlutuante cor={cor} onClick={ () => { 
                setTitleModalConcurso('Adicionar concurso')
                setConcurso({})
                setModalConcursoShow(true) 
            } } />
            <ModalConcurso 
                cor={cor}
                title={ titleModalConcurso }
                show={ modalConcursoShow }
                onHide={ () => { setModalConcursoShow(false) } }
                values={ concurso }
                onSubmit={ handleOnSubmitConcurso }
                onChangeFuncs={ { handleChangeConcurso, handleChangeSelectStatus } }
            >
                {mensagem.msg && <Mensagem text={ mensagem.msg } type={ mensagem.type } />}
            </ModalConcurso>
            { visibleLoading && <Loading cor={cor} /> }
        </div>
    )
}

export default Concurso