import Input from './Input'
import ModalPf from './ModalPf'

function ModalUsuario({ cor, children, title, show, onHide, onSubmit, onChangeFuncs, inputValues }) {
    return (
        <ModalPf
            cor={cor}
            title={ title }
            show={ show }
            onHide={ onHide }
            onSubmit={ onSubmit }
            onChangeFuncs={ onChangeFuncs }
            inputValues={ inputValues }
        >
            <Input 
                cor={cor}
                name='senha'
                type='password'
                placeholder='Senha atual'
                onChange={ onChangeFuncs.handleChangeInputs }
                value={ inputValues?.senha || '' }
            />
            <Input 
                cor={cor}
                name='nova_senha'
                type='password'
                placeholder='Nova senha'
                onChange={ onChangeFuncs.handleChangeInputs }
                value={ inputValues?.nova_senha || '' }
            />
            {children}
        </ModalPf>
    )
}

export default ModalUsuario