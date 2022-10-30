import sequelize from '../db/connection.js'

class Concurso {
    constructor(concurso) {
        this.id_concurso = concurso?.id_concurso
        this.id_pf = concurso?.id_pf
        this.pago = concurso?.pago
        this.tipo = concurso?.tipo
        this.numero = concurso?.numero
        this.data = concurso?.data
        this.premio = concurso?.premio
        this.premio_ganho = concurso?.premio_ganho
        this.total_cotas = concurso?.total_cotas
        this.valor_cota = concurso?.valor_cota
        this.status = concurso?.status
        this.informacao = concurso?.informacao
        this.credito = concurso?.credito
        this.deve = concurso?.deve
        this.falta = concurso?.falta
        this.pagamento = concurso?.pagamento
        this.saldo = concurso?.saldo
    }

    async saveConcurso() {
        await sequelize.query(`
            INSERT INTO concursos (tipo, numero, data, premio, total_cotas, valor_cota, status, informacao)
            VALUES ('${this.tipo}', ${this.numero}, '${this.data}', 
            ${this.premio ? "'"+this.premio+"'" : 'NULL'}, ${this.total_cotas}, ${this.valor_cota}, 
            '${this.status}', ${this.informacao ? "'"+this.informacao+"'" : 'NULL'})
        `)

        const [[{ id_concurso }]] = await sequelize.query('SELECT LAST_INSERT_ID() id_concurso')
        return id_concurso
    }

    async editConcurso() {
        await sequelize.query(`
            UPDATE concursos SET 
            tipo = '${this.tipo}',
            numero = ${this.numero},
            data = '${this.data}',
            premio = ${this.premio ? "'"+this.premio+"'" : 'NULL'},
            premio_ganho = ${this.premio_ganho ? "'"+this.premio_ganho+"'" : 'NULL'},
            total_cotas = ${this.total_cotas},
            valor_cota = ${this.valor_cota},
            status = '${this.status}',
            informacao = ${this.informacao ? "'"+this.informacao+"'" : 'NULL'}
            WHERE id_concurso = ${this.id_concurso}
        `)
    }

    async editParticipante() {
        await sequelize.query(`
            UPDATE concursos_pf SET pago = '${this.pago}'
            WHERE id_concurso = ${this.id_concurso}
            AND id_pf = ${this.id_pf}
        `)
    }

    async saveCota() {
        await sequelize.query(`
            INSERT INTO concursos_pf (id_concurso, id_pf, pago)
            VALUES (${this.id_concurso}, ${this.id_pf}, '${this.pago}')
        `)
    }

    async deleteCota() {
        await sequelize.query(`
            DELETE FROM concursos_pf
            WHERE id_concurso = ${this.id_concurso}
            AND id_pf = ${this.id_pf}
            LIMIT 1
        `)
    }

    async saveCredito() {
        await sequelize.query(`
            INSERT INTO creditos_concursos_pf (id_concurso, id_pf, credito, deve, falta, pagamento, saldo)
            VALUES (${this.id_concurso}, ${this.id_pf}, '${this.credito ? this.credito : 0}', '${this.deve ? this.deve : 0}', '${this.falta ? this.falta : 0}', '${this.pagamento ? this.pagamento : 0}', '${this.saldo ? this.saldo : 0}')
        `)
    }

    async editCredito() {
        await sequelize.query(`
            UPDATE creditos_concursos_pf SET
            credito = '${this.credito ? this.credito : 0}',
            deve = '${this.deve ? this.deve : 0}',
            falta = '${this.falta ? this.falta : 0}',
            pagamento = '${this.pagamento ? this.pagamento : 0}',
            saldo = '${this.saldo ? this.saldo : 0}'
            WHERE id_concurso = ${this.id_concurso}
            AND id_pf = ${this.id_pf}
        `)
    }

    static async verificarSeConcursoExiste(tipo, numero, data) {
        const [concurso] = await sequelize.query(`
            SELECT id_concurso
            FROM concursos
            WHERE tipo = '${tipo}'
            AND numero = ${numero}
            AND data = '${data}'
        `)

        return concurso?.[0]?.id_concurso ?? ''
    }

    static async pegarCreditoParticipanteConcurso(id_concurso, id_pf) {
        const [credito] = await sequelize.query(`
            SELECT id_concurso, 
            id_pf,
            credito,
            deve,
            falta,
            pagamento,
            saldo
            FROM creditos_concursos_pf
            WHERE id_concurso = ${id_concurso}
            AND id_pf = ${id_pf}
        `)

        return credito[0] ? credito[0] : {}
    }

    static async pegarConcursos(tipo, orderCol, orderType) {
        const orderBy = `ORDER BY ${orderCol ? orderCol === 'data' ? 'c.data' : orderCol === 'cotas' ? 'total_cotas' : orderCol : 'c.data'} ${orderType ? orderType: 'DESC'}`

        const [concursos] = await sequelize.query(`
            SELECT c.id_concurso, DATE_FORMAT(c.data, '%d/%m/%y') data, c.numero,  c.premio, c.total_cotas, valor_cota,
            CONCAT((SELECT COUNT(1) FROM concursos_pf WHERE id_concurso = c.id_concurso), '/', CAST(c.total_cotas AS CHAR(50))) contagem,
            status
            FROM concursos c
            ${tipo ? `WHERE tipo = '${tipo}'` : ''}
            ${orderBy}
        `)

        return concursos
    }

    static async pegarConcurso(id_concurso) {
        const [concurso] = await sequelize.query(`
            SELECT id_concurso, numero, tipo, DATE_FORMAT(data, '%d/%m/%Y') data, premio, premio_ganho, total_cotas, 
            CONCAT((SELECT COUNT(1) FROM concursos_pf WHERE id_concurso = ${id_concurso}), '/', CAST(total_cotas AS CHAR(50))) contagem,
            valor_cota, informacao, status
            FROM concursos
            WHERE id_concurso = ${id_concurso}
        `)

        return concurso?.[0] ?? {}
    }

    static async pegarParticipantesConcurso(id_concurso, cotas, status, orderCol, orderType) {
        const where = `WHERE ${cotas ? cotas === 'S' ? 'cotas >= 1 AND' : 'cotas = 0 AND' : '1=1 AND'} ${status ? `status = '${status}'` : '1=1'}`
        const orderBy = `ORDER BY ${orderCol ? orderCol : 'nome'} ${orderType ? orderType: 'ASC'}`

        const [participacoes] = await sequelize.query(`
            SELECT * FROM (SELECT pf.id_pf, pf.cpf, IFNULL(pf.tel_1, pf.tel_2) tel, pf.nome, pf.complemento,
            (SELECT COUNT(1) FROM concursos_pf WHERE id_concurso=${id_concurso} AND id_pf=pf.id_pf) cotas, 
            c_cpf.credito, c_cpf.deve, c_cpf.falta, c_cpf.pagamento, c_cpf.saldo,
            IF((SELECT COUNT(1) FROM concursos_pf WHERE id_concurso=${id_concurso} AND id_pf=pf.id_pf) = 0, NULL, IF((SELECT COUNT(1) FROM concursos_pf WHERE id_concurso=${id_concurso} AND id_pf=pf.id_pf AND pago='N') >= 1, 'Pendente', 'Pago')) status
            FROM pf LEFT JOIN creditos_concursos_pf c_cpf ON (c_cpf.id_concurso=${id_concurso} AND c_cpf.id_pf=pf.id_pf)) participantes
            ${where}
            ${orderBy}
        `)

        return participacoes
    }

    static async pegarConcursoRecente(tipo) {
        const [concurso] = await sequelize.query(`
            SELECT c.id_concurso, c.tipo, c.numero, DATE_FORMAT(c.data, '%d/%m/%y') data, c.informacao,
            CONCAT((SELECT COUNT(1) FROM concursos_pf WHERE id_concurso = c.id_concurso), '/', CAST(c.total_cotas AS CHAR(50))) contagem
            FROM concursos c
            WHERE c.tipo='${tipo}' AND c.status='Ativo' ORDER BY c.data DESC LIMIT 1
        `) 

        return concurso[0] ?? {}
    }

    static async pegarParticipantesConcursoHome(id_concurso) {
        const [participantes] = await sequelize.query(`
            SELECT * FROM (SELECT pf.cpf, IFNULL(pf.tel_1, pf.tel_2) tel, pf.nome,
            (SELECT COUNT(1) FROM concursos_pf c_cpf
            WHERE id_concurso='${id_concurso}' AND id_pf=pf.id_pf) cotas,
            IF(c_cpf.saldo <= 0 OR ISNULL(c_cpf.saldo), NULL, c_cpf.saldo) saldo
            FROM pf
            LEFT JOIN creditos_concursos_pf c_cpf ON (c_cpf.id_concurso='${id_concurso}' AND c_cpf.id_pf=pf.id_pf)) participantes
            WHERE cotas >= 1
            OR saldo > 0
        `)

        return participantes
    }

    static async pegarCotasParticipante(id_concurso, id_pf) {
        const [cotas] = await sequelize.query(`
            SELECT COUNT(1) total,
            IF((SELECT COUNT(1) FROM concursos_pf WHERE id_concurso=${id_concurso} AND id_pf=${id_pf}) = 0, 'N', IF((SELECT COUNT(1) FROM concursos_pf WHERE id_concurso=${id_concurso} AND id_pf=${id_pf} AND pago='N') >= 1, 'N', 'S')) pago
            FROM concursos_pf 
            WHERE id_concurso=${id_concurso} 
            AND id_pf=${id_pf}
        `)

        return { total_cotas: cotas?.[0]?.total ? parseInt(cotas?.[0]?.total) : 0, pago: cotas?.[0]?.pago ?? 'N' }
    }

    static async pegarQtdeCotasConcurso(id_concurso) {
        const [cotas] = await sequelize.query(`
            SELECT COUNT(1) total
            FROM concursos_pf
            WHERE id_concurso=${id_concurso}
        `)

        return cotas[0]?.total ? parseInt(cotas[0]?.total) : 0
    }

    static async pegarSaldosUltimoConcurso(id_concurso, tipo) {
        const [saldos] = await sequelize.query(`
            SELECT c_cpf.saldo, c_cpf.id_pf
            FROM creditos_concursos_pf c_cpf
            LEFT JOIN concursos c ON (c.id_concurso=c_cpf.id_concurso)
            WHERE c.id_concurso <> ${id_concurso}
            AND c.tipo = '${tipo}'
            ORDER BY c.cadastro DESC
            LIMIT 1
        `)

        return saldos
    }
}

export default Concurso