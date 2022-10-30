import User from '../models/User.js'
import Pf from '../models/Pf.js'
import bcrypt from 'bcrypt'
import createToken from '../helpers/create-token.js'
import validatorCpf from '../helpers/cpf-validator.js'

class userController {
    static async createUser(req, res) {
        try {
            const { cpf, nome, email, tel1, tel2, senha, complemento, status } = req.body

            if (nome && email && senha && status) {
                const cpfNoMask = cpf?.replace(/[^0-9]+/g, '')
                const tel1NoMask = tel1?.replace(/[^0-9]+/g, '')
                const tel2NoMask = tel2?.replace(/[^0-9]+/g, '') 

                if (cpf) {
                    if (!validatorCpf(cpfNoMask)) {
                        res.status(422).json({ ok: false, message: 'Informe um CPF válido.' })
                        return
                    }
                }

                let id_pf = await Pf.verificarSePfExiste(cpfNoMask, email)
                const usuarioExiste = await User.verificarSeUsuarioExiste(id_pf)

                if (!usuarioExiste) {
                    if (!id_pf) {
                        const pf = new Pf({ cpf: cpfNoMask, nome: nome.toUpperCase(), email, tel1: tel1NoMask, tel2: tel2NoMask, complemento })
                        id_pf = await pf.savePf()
                    }

                    const salt = await bcrypt.genSalt(12)
                    const senhaHash = await bcrypt.hash(senha, salt)

                    const user = new User({ id_pf, senha: senhaHash, status })
                    await user.saveUser()

                    res.status(200).json({ ok: true, message: 'Usuário cadastrado com êxito.' })
                    return
                }

                res.status(422).json({ ok: false, message: 'Não foi possível realizar o cadastro de usuário.' })
                return
            }

            res.status(422).json({ ok: false, message: 'Informe os campos corretamente.' })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }

    static async editUser(req, res) {
        try {
            const { id_usuario, id_pf, cpf, nome, email, tel1, tel2, senha, nova_senha, complemento } = req.body

            if (id_usuario && id_pf && nome && email) {
                if (req.user.id_usuario !== id_usuario) {
                    res.status(422).json({ ok: false, message: 'Não foi possível alterar seu perfil.' })
                    return
                }

                const cpfNoMask = cpf?.replace(/[^0-9]+/g, '')
                const tel1NoMask = tel1?.replace(/[^0-9]+/g, '')
                const tel2NoMask = tel2?.replace(/[^0-9]+/g, '') 

                if (cpf) {
                    if (!validatorCpf(cpfNoMask)) {
                        res.status(422).json({ ok: false, message: 'Informe um CPF válido.' })
                        return
                    }
                }

                const pfExistente = await Pf.pegarPf(id_pf)

                if (!pfExistente.id_pf) {
                    res.status(422).json({ ok: false, message: 'Não foi possível alterar seu perfil.' })
                    return
                }

                if (pfExistente.cpf != cpfNoMask) {
                    const pf = await Pf.verificarSePfExiste(cpfNoMask)

                    if (pf) {
                        res.status(422).json({ ok: false, message: 'Essa pessoa já foi cadastrada.' })
                        return
                    }
                }

                if (pfExistente.email != email) {
                    const pf = await Pf.verificarSePfExiste('', email)

                    if (pf) {
                        res.status(422).json({ ok: false, message: 'Essa pessoa já foi cadastrada.' })
                        return
                    }
                }

                if (senha) {
                    if (!nova_senha) {
                        res.status(422).json({ ok: false, message: 'Informe a nova senha.' })
                        return
                    }

                    const usuario = await User.pegarUsuario('', id_usuario)

                    const senhaValida = await bcrypt.compare(senha, usuario.senha)

                    if (!senhaValida) {
                        res.status(422).json({ ok: false, message: 'Informe a senha corretamente.' })
                        return
                    }

                    const salt = await bcrypt.genSalt(12)
                    const novaSenha = await bcrypt.hash(nova_senha, salt)

                    const user = new User({ id_usuario, senha: novaSenha })
                    await user.editUser()
                }

                const pf = new Pf({ id_pf, cpf: cpfNoMask, nome: nome.toUpperCase(), email, tel1: tel1NoMask, tel2: tel2NoMask, complemento: complemento?.toUpperCase() ?? null })
                await pf.editPf()

                res.status(200).json({ ok: true, message: 'Perfil alterado com êxito.' })
                return
            }

            res.status(422).json({ ok: false, message: 'Informe os campos corretamente.' })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }

    static async loginUser(req, res) {
        try {
            const { email, senha } = req.body

            if (email && senha) {
                let id_pf = await Pf.verificarSePfExiste('', email)

                if (!id_pf) {
                    res.status(422).json({ ok: false, message: 'Dados incorretos.' })
                    return
                }

                const usuario = await User.pegarUsuario(id_pf)

                if (!usuario) {
                    res.status(422).json({ ok: false, message: 'Dados incorretos.' })
                    return
                }

                const senhaValida = await bcrypt.compare(senha, usuario.senha)

                if (!senhaValida) {
                    res.status(422).json({ ok: false, message: 'Dados incorretos.' })
                    return
                }

                const token = createToken(usuario.id_usuario)
                await User.atualizarUltimoAcesso(usuario.id_usuario)

                res.status(200).json({ ok: true, data: { token } })
                return
            } 

            res.status(422).json({ ok: false, message: 'Informe os campos corretamente.' })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }

    static async getUser(req, res) {
        try {
            const { id_usuario } = req.user

            const usuario = await User.pegarDadosUsuario(id_usuario)

            res.status(200).json({ ok: true, data: { usuario } })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }
}

export default userController