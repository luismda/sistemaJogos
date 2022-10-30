import sequelize from '../db/connection.js'
import Pf from './Pf.js'

class User {
    constructor(user) {
        this.id_usuario = user?.id_usuario ?? null
        this.id_pf = user?.id_pf ?? null
        this.senha = user?.senha ?? null
        this.status = user?.status ?? null
    }

    async saveUser() {
        await sequelize.query(`
            INSERT INTO usuarios (id_pf, senha, status)
            VALUES (${this.id_pf}, '${this.senha}', '${this.status}')
        `)
    }

    async editUser() {
        await sequelize.query(`
            UPDATE usuarios SET
            senha = '${this.senha}'
            WHERE id_usuario = ${this.id_usuario}
        `)
    }

    static async verificarSeUsuarioExiste(id_pf, id_usuario) {
        const [user] = await sequelize.query(`
            SELECT id_usuario
            FROM usuarios
            WHERE id_pf = '${id_pf ? id_pf : ''}'
            OR id_usuario = '${id_usuario ? id_usuario : ''}'
            AND status = 'Ativo'
        `)

        return user?.[0]?.id_usuario ?? ''
    }

    static async pegarUsuario(id_pf, id_usuario) {
        const [user] = await sequelize.query(`
            SELECT id_usuario, id_pf, senha, acesso, status
            FROM usuarios
            WHERE id_pf = '${id_pf ? id_pf : ''}'
            OR id_usuario = '${id_usuario ? id_usuario : ''}'
            AND status = 'Ativo'
        `)

        return user?.[0]
    }

    static async pegarDadosUsuario(id_usuario) {
        const [user] = await sequelize.query(`
            SELECT u.id_usuario, pf.id_pf, u.status, pf.cpf, pf.nome, pf.email, pf.tel_1 tel1, pf.tel_2 tel2, pf.complemento
            FROM usuarios u
            INNER JOIN pf ON (pf.id_pf=u.id_pf)
            WHERE u.id_usuario = ${id_usuario}
            AND u.status = 'Ativo'
        `)

        return user?.[0] ?? {}
    }

    static async atualizarUltimoAcesso(id_usuario) {
        await sequelize.query(`
            UPDATE usuarios SET acesso = NOW()
            WHERE id_usuario = ${id_usuario}
        `)
    }
}

export default User