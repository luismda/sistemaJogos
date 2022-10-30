import SelectAsync from 'react-select/async'
import SelectNormal from 'react-select'
import SelectCreatable from 'react-select/creatable'
import '../../styles/components/Select.css'

function Select({ cor, type, placeholder, isMulti, isSearchable, options, value, defaultValue, onChange, loadOptions, className }) {
    return type === 'async' ? (
        <SelectAsync 
            placeholder={ placeholder }
            loadingMessage={ () => 'Pesquisando...' }
            noOptionsMessage={ () => 'Sem resultados.' }
            isMulti={ isMulti }
            isSearchable={ isSearchable }
            cacheOptions
            defaultOptions
            options={ options }
            loadOptions={ loadOptions }
            value={ value }
            onChange={ onChange }
            className={cor}
        />
    ) : type === 'creatable' ? (
        <SelectCreatable 
            placeholder={ placeholder }
            isMulti={ isMulti }
            formatCreateLabel={ inputValue => `Criando "${inputValue}"` }
            value={ value }
            onChange={ onChange }
            noOptionsMessage={ () => 'Digite e confirme para criar uma opção.' }
            className={cor}
        />
    ) : (
        <SelectNormal 
            placeholder={ placeholder }
            isSearchable={ isSearchable }
            options={ options }
            defaultValue={ defaultValue }
            value={ value }
            onChange={ onChange }
            className={ `${className} ${cor}` }
        />
    )
}

export default Select