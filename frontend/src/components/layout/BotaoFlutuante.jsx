import { FaPlus  } from 'react-icons/fa'
import botaoStyles from '../../styles/components/BotaoFlutuante.module.css'

function BotaoFlutuante({ type, onClick, cor }) {
    return (
        <button className={ `${botaoStyles.btn} ${botaoStyles[cor]}` } onClick={ onClick }>
            <FaPlus />
        </button>
    )
}

export default BotaoFlutuante