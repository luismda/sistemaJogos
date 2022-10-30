import mensagemStyles from '../../styles/components/Mensagem.module.css'

function Mensagem({ text, type }) {
    return (
        <p 
            className={ `${mensagemStyles.mensagem} ${type === 'success' ? mensagemStyles.success : mensagemStyles.error }` }>
            { text }
        </p>
    )
}

export default Mensagem