const createMask = (value, type) => 
    type === 'cpf'
        ? value
            ?.toString()
            ?.replace(/\D/g, '')
            ?.replace(/(\d{3})(\d)/, '$1.$2')
            ?.replace(/(\d{3})(\d)/, '$1.$2')
            ?.replace(/(\d{3})(\d{1,2})/, '$1-$2')
            ?.replace(/(-\d{2})\d+?$/, '$1') ?? ''
        : type === 'tel'
        ? value
            ?.toString()
            ?.replace(/\D/g,'')
            ?.replace(/(\d{2})(\d)/,"($1) $2")
            ?.replace(/(\d)(\d{4})$/,"$1-$2") ?? ''
        : ''

export default createMask