const mask = (value, type) => {
    if (type === 'cpf') {
        return value
            ?.toString()
            ?.replace(/\D/g, '')
            ?.replace(/(\d{3})(\d)/, '$1.$2')
            ?.replace(/(\d{3})(\d)/, '$1.$2')
            ?.replace(/(\d{3})(\d{1,2})/, '$1-$2')
            ?.replace(/(-\d{2})\d+?$/, '$1') ?? ''
    }

    if (type === 'tel') {
        return value
            ?.toString()
            ?.replace(/\D/g,'')
            ?.replace(/(\d{2})(\d)/,"($1) $2")
            ?.replace(/(\d)(\d{4})$/,"$1-$2") ?? ''
    }

    if (type === 'data') {
        return value
            ?.toString()
            ?.replace(/\D/g,'')
            ?.replace(/(\d{2})(\d)/,'$1/$2')
            ?.replace(/(\d{2})(\d)/,'$1/$2')
            ?.replace(/(\/\d{4})\d+?$/, '$1') ?? ''
    }

    if (type === 'dinheiro') {
        value = value.toString().replace('.', '').replace(',', '').replace(/[^\-\d]/g, '')

        const options = { minimumFractionDigits: 2 }
        const result = new Intl.NumberFormat('pt-BR', options).format(
            parseFloat(value ? value : 0) / 100
        )
          
        return 'R$ ' + result
    }
}

export default mask