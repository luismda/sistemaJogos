import sequelize from '../db/connection.js'

class Pf {
    constructor(pf) {
        this.id_pf = pf?.id_pf ?? null
        this.cpf = pf?.cpf ?? null
        this.nome = pf?.nome ?? null
        this.email = pf?.email ?? null
        this.tel1 = pf?.tel1 ?? null
        this.tel2 = pf?.tel2 ?? null
        this.complemento = pf?.complemento ?? null
    }

    async savePf() {
        await sequelize.query(`
            INSERT INTO pf (cpf, nome, email, tel_1, tel_2, complemento)
            VALUES (${this.cpf ? "'"+this.cpf+"'" : 'NULL'}, '${this.nome}', ${this.email ? "'"+this.email+"'" : 'NULL'}, 
            ${this.tel1 ? "'"+this.tel1+"'" : 'NULL'}, ${this.tel2 ? "'"+this.tel2+"'" : 'NULL'},
            ${this.complemento ? "'"+this.complemento+"'" : 'NULL'})
        `)  

        const [[{ id_pf }]] = await sequelize.query(`SELECT LAST_INSERT_ID() id_pf`)

        return id_pf
    }

    async editPf() {
        await sequelize.query(`
            UPDATE pf SET
            cpf = ${this.cpf ? "'"+this.cpf+"'" : 'NULL'},
            nome = '${this.nome}',
            email = ${this.email ? "'"+this.email+"'" : 'NULL'},
            tel_1 = ${this.tel1 ? "'"+this.tel1+"'" : 'NULL'},
            tel_2 = ${this.tel2 ? "'"+this.tel2+"'" : 'NULL'},
            complemento = ${this.complemento ? "'"+this.complemento+"'" : 'NULL'}
            WHERE id_pf = ${this.id_pf}
        `)
    }

    static async verificarSePfExiste(cpf, email) {
        const [pf] = await sequelize.query(`
            SELECT id_pf
            FROM pf
            WHERE cpf = '${cpf ? cpf : ''}'
            OR email = '${email ? email : ''}'
        `)

        return pf?.[0]?.id_pf ?? ''
    }

    static async pegarPf(id_pf) {
        const [pf] = await sequelize.query(`
            SELECT id_pf, cpf, nome, email, tel_1 tel1, tel_2 tel2, complemento
            FROM pf
            WHERE id_pf = ${id_pf}
        `)

        return pf?.[0] ?? {}
    }

    static async pegarPfs(orderCol, orderType) {
        const orderBy = `ORDER BY ${orderCol ? orderCol : 'nome'} ${orderType ? orderType: 'ASC'}`

        const [pfs] = await sequelize.query(`
            SELECT id_pf, cpf, nome, IFNULL(tel_1, tel_2) tel, complemento
            FROM pf
            ${orderBy}
        `)

        return pfs
    }
}

export default Pf