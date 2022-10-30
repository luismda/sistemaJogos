import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

import { Accordion } from 'react-bootstrap'
import Select from '../layout/Select'
import Tabela from '../layout/Tabela'
import Loading from '../layout/Loading'
import api from '../../utils/api'
import mask from '../../utils/mask'
import homeStyles from '../../styles/components/Home.module.css'

function Home() {
    const [concurso, setConcurso] = useState({})
    const [visibleTable, setVisibleTable] = useState(false)
    const [participantes, setParticipantes] = useState([])
    const [visibleLoading, setVisibleLoading] = useState(false)
    const [cor, setCor] = useState('')

    useEffect(() => {
        getParticipantes(concurso.tipo)
        
        setCor(concurso.tipo === 'Lotofácil' ? 'roxo' : concurso.tipo === 'Mega-sena' ? 'verde' : '')
    }, [concurso.tipo])

    const getParticipantes = value => {
        if (value) {
            setVisibleLoading(true)

            api.get(`/concurso/participantes/home/${value === 'Lotofácil' ? 1 : value === 'Mega-sena' ? 2 : value}`).then(response => {
                setConcurso(response.data.data.concurso)
                setParticipantes(response.data.data.participantes.map(participante => ({
                    ...participante,
                    cotas: participante.cotas === 0 ? null : participante.cotas,
                    saldo: participante.saldo ? mask(participante.saldo, 'dinheiro').replace('R$', '').trim() : '-'
                })))
                setVisibleTable(true)
    
                setVisibleLoading(false)
            }).catch((error) => {
                setVisibleTable(false)
                setVisibleLoading(false)
            })
        }
    }

    const handleChangeSelectConcurso = async ({ value }) => {
        getParticipantes(value)
    }

    return (
        <div className='container-fluid px-0'>
            {visibleTable ? (
                <>
                    <div className={homeStyles.concurso_info}>
                        <div className='ms-2 d-flex align-items-center'>
                            <Link 
                                className={`ms-3 ${homeStyles.link_voltar} ${homeStyles[cor]}`} 
                                onClick={() => { setVisibleTable(false) }}
                            >
                                <FaArrowLeft /> Voltar
                            </Link>
                        </div>
                        {concurso.tipo ? <div className='d-flex align-items-center'>({`${concurso.tipo} - ${concurso.numero} - ${concurso.data}`})</div> : ''}
                        <div className='me-2 d-flex justify-content-center'>
                            <span 
                                className='badge py-2 me-3' 
                                style={{
                                    backgroundColor: cor === 'roxo' ? '#7144b9' : '#00a884',
                                    height: '27px'
                                }}>
                                    {concurso.contagem}
                            </span>
                        </div>
                    </div>
                    {concurso.informacao && (
                        <Accordion defaultActiveKey="0">
                            <Accordion.Item>
                                <Accordion.Header>
                                    Informação
                                </Accordion.Header>
                                <Accordion.Body>
                                    {concurso.informacao}
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    )}
                    <div className='row w-100 m-0 d-flex justify-content-center align-items-center'>
                        <div className='col-md-12 px-4'>
                            <Tabela 
                                cor={cor}
                                colunas={ ['CPF', 'Tel.', 'Nome', 'Cotas', 'Saldo'] }
                                dados={ participantes }
                                propriedades={ ['cpf', 'tel', 'nome', 'cotas', 'saldo'] }
                                notAuthenticated
                                className='tabela_home'
                                fixedHeader
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className='row w-100 m-0 d-flex justify-content-center align-items-center' style={{height: '100vh', backgroundColor: '#0079bf'}}>
                    <div className='col-md-4'>
                        <div className='card'>
                            <h2 className='mb-2'>Participantes</h2>
                            <p style={{marginBottom: '0', color: 'gray', fontSize: '14px'}}>Selecione abaixo para ver participantes</p>
                            <Select 
                                type='normal'
                                placeholder='Escolha o concurso'
                                isMulti={ false }
                                isSearchable={ false }
                                options={ [
                                    { value: '1', label: 'Lotofácil' },
                                    { value: '2', label: 'Mega-sena' }
                                ] }
                                onChange={ handleChangeSelectConcurso }
                                className={homeStyles.select_concurso}
                            />
                        </div>
                    </div>
                </div>
            )}
            { visibleLoading && <Loading /> }
        </div>
    )
}

export default Home