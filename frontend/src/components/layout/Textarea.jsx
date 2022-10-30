import textareaStyles from '../../styles/components/Textarea.module.css'

function Textarea({ cor, name, placeholder, value, onChange }){
    return (
        <textarea 
            name={name} 
            placeholder={placeholder} 
            className={`form-control mb-3 ${textareaStyles.textarea} ${textareaStyles[cor]}`}
            value={value}
            onChange={onChange}
        />
    )
}

export default Textarea