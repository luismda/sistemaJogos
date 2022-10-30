import { Modal } from 'react-bootstrap'
import Input from './Input'
import Select from './Select'
import '../../styles/components/ModalPf.css'

function ModalPf({ cor, children, title, show, onHide, onSubmit, onChangeFuncs, inputValues }) {
    return (
        <Modal
            show={ show }
            onHide={ onHide }
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header className='m_header' closeButton>
                <Modal.Title className={`m_title ${cor}`}>{ title }</Modal.Title>
            </Modal.Header>
            <form onSubmit={ onSubmit }>
                <Modal.Body>
                    <Input 
                        cor={cor}
                        name='cpf'
                        type='text'
                        placeholder='CPF'
                        onChange={ onChangeFuncs.handleChangeInputs }
                        value={ inputValues?.cpf || '' }
                    />
                    <Input 
                        cor={cor}
                        name='nome'
                        type='text'
                        placeholder='Nome'
                        onChange={ onChangeFuncs.handleChangeInputs }
                        value={ inputValues?.nome || '' }
                    />
                    <Input 
                        cor={cor}
                        name='email'
                        type='email'
                        placeholder='E-mail'
                        onChange={ onChangeFuncs.handleChangeInputs }
                        value={ inputValues?.email || '' }
                    />
                    <Input 
                        cor={cor}
                        name='tel1'
                        type='tel'
                        placeholder='Telefone 1'
                        maxlength='15'
                        onChange={ onChangeFuncs.handleChangeInputs }
                        value={ inputValues?.tel1 || '' }
                    />
                    <Input 
                        cor={cor}
                        name='tel2'
                        type='tel'
                        placeholder='Telefone 2'
                        maxlength='15'
                        onChange={ onChangeFuncs.handleChangeInputs }
                        value={ inputValues?.tel2 || '' }
                    />
                    <Select 
                        cor={cor}
                        type='creatable'
                        placeholder='Nomes de contas para o PIX'
                        isMulti={ true }
                        onChange={ onChangeFuncs.handleChangeSelectComplemento }
                        value={ inputValues?.complemento || null }
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

export default ModalPf