import inputStyles from '../../styles/components/Input.module.css' 

function Input({ cor, name, type, placeholder, minlength, maxlength, min, value, onChange, onBlur, className, data }) {
    return (
        <div>
            <input 
                className={ `form-control ${className ? className : 'mb-3'} ${inputStyles.input} ${inputStyles[cor]}` }
                name={ name }
                type={ type }
                placeholder={ placeholder }
                minLength={ minlength }
                maxLength={ maxlength }
                min={ min }
                data={ data }
                value={ value }
                onChange={ onChange }
                onBlur={ onBlur }
            />
        </div>
    )
}

export default Input