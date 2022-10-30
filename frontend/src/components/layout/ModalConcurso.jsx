import { Modal } from 'react-bootstrap'
import Input from './Input'
import Select from './Select'
import Textarea from './Textarea'
import modalConcursoStyles from '../../styles/components/ModalConcurso.module.css'

function ModalConcurso({ cor, children, title, show, onHide, onSubmit, onChangeFuncs, values }) {
    return (
        <Modal
            show={ show }
            onHide={ onHide }
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            backdrop="static"
            keyboard={false}
            className='fade'
        >
            <Modal.Header className={ `m_header ${modalConcursoStyles.header}` } closeButton>
                <Modal.Title className={`m_title ${cor}`}>{ title }</Modal.Title>
            </Modal.Header>
                <form onSubmit={ onSubmit }>
                    <Modal.Body>
                        <div className={ modalConcursoStyles.grid_group_form_1 }>
                            <Input 
                                cor={cor}
                                name='numero'
                                type='number'
                                placeholder='Número'
                                value={ values?.numero || '' }
                                onChange={ onChangeFuncs.handleChangeConcurso }
                            />
                            <Input 
                                cor={cor}
                                name='data'
                                type='text'
                                placeholder='Data'
                                minlength='10'
                                value={ values?.data || '' }
                                onChange={ onChangeFuncs.handleChangeConcurso }
                            />
                        </div>
                        <Input 
                            cor={cor}
                            name='premio'
                            type='text'
                            placeholder='Prêmio'
                            value={ values?.premio || '' }
                            onChange={ onChangeFuncs.handleChangeConcurso }
                        />
                        <div className={ modalConcursoStyles.grid_group_form_1 }>
                            <Input 
                                cor={cor}
                                name='total_cotas'
                                type='number'
                                placeholder='Total de cotas'
                                value={ values?.total_cotas || '' }
                                onChange={ onChangeFuncs.handleChangeConcurso }
                            />
                            <Input 
                                cor={cor}
                                name='valor_cota'
                                type='text'
                                placeholder='Valor da cota'
                                value={ values?.valor_cota || '' }
                                onChange={ onChangeFuncs.handleChangeConcurso }
                            />
                        </div>
                        <Select 
                            cor={cor}
                            type='normal'
                            placeholder='Status'
                            isMulti={ false }
                            isSearchable={ false }
                            options={ [
                                { value: 'Ativo', label: 'Ativo' }, 
                                { value: 'Adiado', label: 'Adiado' }, 
                                { value: 'Cancelado', label: 'Cancelado' },
                                { value: 'Concluído', label: 'Concluído' }
                            ] }
                            value={ values?.status || null }
                            onChange={ onChangeFuncs.handleChangeSelectStatus }
                        />
                        {title === 'Editar concurso' && <Input 
                            cor={cor}
                            name='premio_ganho'
                            type='text'
                            placeholder='Prêmio ganhado'
                            value={ values?.premio_ganho || '' }
                            onChange={ onChangeFuncs.handleChangeConcurso }
                        />}
                        <Textarea
                            cor={cor}
                            name='informacao'
                            placeholder='Informação'
                            value={ values?.informacao || '' }
                            onChange={ onChangeFuncs.handleChangeConcurso }
                        />
                        { children }
                    </Modal.Body>
                    <Modal.Footer>
                        <button type='submit' className={`btn ${cor}`}>Salvar</button>
                    </Modal.Footer>
                </form>
        </Modal>
    )
}

export default ModalConcurso