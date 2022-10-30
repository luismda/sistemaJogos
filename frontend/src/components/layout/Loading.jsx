import loadingStyles from '../../styles/components/Loading.module.css'

function Loading({ cor }) {
    return (
        <div className={ `${loadingStyles.loading} ${loadingStyles[cor]}` }>
            <span></span>
        </div>
    )
}

export default Loading