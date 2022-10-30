import { cpf } from 'cpf-cnpj-validator'

const validatorCpf = doc => cpf.isValid(doc)

export default validatorCpf