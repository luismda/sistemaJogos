import Pf from '../models/Pf.js'
import axios from 'axios'
import validatorCpf from '../helpers/cpf-validator.js'

class pfController {
    static async createPf(req, res) {
        try {
            const { cpf, nome, email, tel1, tel2, complemento } = req.body

            if (nome) {
                const cpfNoMask = cpf?.replace(/[^0-9]+/g, '')
                const tel1NoMask = tel1?.replace(/[^0-9]+/g, '')
                const tel2NoMask = tel2?.replace(/[^0-9]+/g, '') 

                if (cpf) {
                    if (!validatorCpf(cpfNoMask)) {
                        res.status(422).json({ ok: false, message: 'Informe um CPF válido.' })
                        return
                    }
                }

                const id_pf = await Pf.verificarSePfExiste(cpfNoMask, email)

                if (id_pf) {
                    res.status(422).json({ ok: false, message: 'Essa pessoa já foi cadastrada.' })
                    return
                }

                const pf = new Pf({ cpf: cpfNoMask, nome: nome.toUpperCase(), email, tel1: tel1NoMask, tel2: tel2NoMask, complemento: complemento?.toUpperCase() ?? null })
                const idPf = await pf.savePf()

                res.status(200).json({ ok: true, message: 'Pessoa cadastrada com êxito.', data: { id_pf: idPf } })
                return
            }

            res.status(422).json({ ok: false, message: 'Informe os campos corretamente.' })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }

    static async editPf(req, res) {
        try {
            const { id_pf, cpf, nome, email, tel1, tel2, complemento } = req.body

            if (id_pf && nome) {
                const cpfNoMask = cpf?.replace(/[^0-9]+/g, '')
                const tel1NoMask = tel1?.replace(/[^0-9]+/g, '')
                const tel2NoMask = tel2?.replace(/[^0-9]+/g, '') 

                if (cpf) {
                    if (!validatorCpf(cpfNoMask)) {
                        res.status(422).json({ ok: false, message: 'Informe um CPF válido.' })
                        return
                    }
                }

                const pessoa = await Pf.pegarPf(id_pf)

                if (pessoa.cpf != cpfNoMask) {
                    const id_pf = await Pf.verificarSePfExiste(cpfNoMask)

                    if (id_pf) {
                        res.status(422).json({ ok: false, message: 'Essa pessoa já foi cadastrada.' })
                        return
                    }
                }

                if (pessoa.email != email) {
                    const id_pf = await Pf.verificarSePfExiste('', email)

                    if (id_pf) {
                        res.status(422).json({ ok: false, message: 'Essa pessoa já foi cadastrada.' })
                        return
                    }
                }

                const pf = new Pf({ id_pf, cpf: cpfNoMask, nome: nome.toUpperCase(), email, tel1: tel1NoMask, tel2: tel2NoMask, complemento: complemento?.toUpperCase() ?? null })
                await pf.editPf()

                res.status(200).json({ ok: true, message: 'Pessoa alterada com êxito.' })
                return
            }

            res.status(422).json({ ok: false, message: 'Informe os campos corretamente.' })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }

    static async getPfs(req, res) {
        try {
            const { orderCol, orderType } = req.query

            const pfs = await Pf.pegarPfs(orderCol, orderType)

            res.status(200).json({ ok: true, data: { pfs } })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }

    static async getPf(req, res) {
        try {
            const { id } = req.params

            const pf = await Pf.pegarPf(id)

            res.status(200).json({ ok: true, data: { pf } })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }

    static async getDadosProcobPf(req, res) {
        try {
            const { cpf } = req.params

            if (!cpf) {
                res.status(422).json({ ok: false, message: 'Informe o CPF corretamente.' })
                return
            }

            const cpfNoMask = cpf.replace(/[^0-9]+/g, '')
            
            if (!validatorCpf(cpfNoMask)) {
                res.status(422).json({ ok: false, message: 'Informe um CPF válido.' })
                return
            }

            const pfExiste = await Pf.verificarSePfExiste(cpfNoMask)

            if (pfExiste) {
                res.status(422).json({ ok: false, message: 'Esse cpf já está cadastrado.' })
                return
            }

            const { data } = await axios({
                url: `https://sistema.t4gn.com.br/api/procob/${cpfNoMask}/4`,
                method: 'GET'
            })

            res.status(200).json({ ok: true, data: { nome: data?.content?.nome?.conteudo?.nome ?? '' } })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }
}

export default pfController