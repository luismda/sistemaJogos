import Concurso from '../models/Concurso.js'
import createMask from '../helpers/create-mask.js'
import abbreviateName from '../helpers/abbreviate-name.js'

class concursoController {
    static async createConcurso(req, res) {
        try {
            const { tipo, numero, data, premio, total_cotas, valor_cota, status, informacao } = req.body

            if (tipo && numero && data && total_cotas && valor_cota && status) {
                const dataFormatada = data.split('/').reverse().join('-')

                const concursoExiste = await Concurso.verificarSeConcursoExiste(tipo, numero, dataFormatada)

                if (concursoExiste) {
                    res.status(422).json({ ok: false, message: 'Essa concurso já foi cadastrado.' })
                    return
                }

                const concurso = new Concurso({ tipo, numero, data: dataFormatada, premio, total_cotas, valor_cota, status, informacao })
                const id_concurso = await concurso.saveConcurso()

                const saldosUltimoConcurso = await Concurso.pegarSaldosUltimoConcurso(id_concurso, tipo)

                for(let i in saldosUltimoConcurso){
                    if (parseFloat(saldosUltimoConcurso[i].saldo) < 0) {
                        const credito = new Concurso({ id_concurso, id_pf: saldosUltimoConcurso[i].id_pf, deve: parseFloat(saldosUltimoConcurso[i].saldo.toString().replace('-', '')) })
                        await credito.saveCredito()
                    } else {
                        const credito = new Concurso({ id_concurso, id_pf: saldosUltimoConcurso[i].id_pf, saldo: parseFloat(saldosUltimoConcurso[i].saldo), deve: parseFloat(saldosUltimoConcurso[i].deve) > 0 ? parseFloat(saldosUltimoConcurso[i].deve) : 0 })
                        await credito.saveCredito()
                    }
                }

                res.status(200).json({ ok: true, message: 'Concurso criado com êxito.' })
                return
            }

            res.status(422).json({ ok: false, message: 'Informe os campos corretamente.' })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }

    static async editConcurso(req, res) {
        try {
            const { id_concurso, tipo, numero, data, premio, premio_ganho, total_cotas, valor_cota, status, informacao } = req.body

            if (id_concurso && tipo && numero && data && total_cotas && valor_cota && status) {
                const dataFormatada = data.split('/').reverse().join('-')

                const concursoExistente = await Concurso.pegarConcurso(id_concurso)

                if (concursoExistente?.tipo != tipo || concursoExistente?.numero != numero || concursoExistente?.data?.split('/')?.reverse()?.join('-') != dataFormatada) {
                    const concursoExiste = await Concurso.verificarSeConcursoExiste(tipo, numero, dataFormatada)

                    if (concursoExiste) {
                        res.status(422).json({ ok: false, message: 'Essa concurso já foi cadastrado.' })
                        return
                    }
                }

                const concurso = new Concurso({ id_concurso, tipo, numero, data: dataFormatada, premio, premio_ganho, total_cotas, valor_cota, status, informacao })
                await concurso.editConcurso()

                const participantes = await Concurso.pegarParticipantesConcurso(id_concurso)

                if (premio_ganho) {
                    const premioPorCota = premio_ganho / parseInt(concursoExistente.contagem?.split('/')?.[0])

                    for(let i in participantes){
                        const premioPorParticipante = parseInt(participantes[i].cotas) * premioPorCota

                        const credito = new Concurso({ 
                            id_concurso, 
                            id_pf: participantes[i].id_pf,
                            credito: participantes[i].credito,
                            deve: participantes[i].deve,
                            falta: participantes[i].falta,
                            pagamento: participantes[i].pagamento,
                            saldo: parseFloat(participantes[i].saldo) + premioPorParticipante
                        })
                        await credito.editCredito()
                    }
                }

                if (parseFloat(concursoExistente.valor_cota) !== parseFloat(valor_cota)) {
                    for(let i in participantes){
                        const valorTotal = parseInt(participantes[i].cotas) * parseFloat(valor_cota)

                        const { falta, saldo } = await concursoController.calcularFaltaSaldoParticipante({
                            valor_total: valorTotal,
                            credito: participantes[i].credito,
                            deve: participantes[i].deve,
                            pagamento: participantes[i].pagamento
                        })

                        const creditoParticipante = new Concurso({ 
                            id_concurso, 
                            id_pf: participantes[i].id_pf, 
                            credito: parseFloat(participantes[i].credito), 
                            deve: parseFloat(participantes[i].deve), 
                            falta, 
                            pagamento: parseFloat(participantes[i].pagamento), 
                            saldo 
                        })
                        await creditoParticipante.editCredito()
                    }
                }

                res.status(200).json({ ok: true, message: 'Concurso alterado com êxito.' })
                return
            }

            res.status(422).json({ ok: false, message: 'Informe os campos corretamente.' })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }

    static async calcularFaltaSaldoParticipante({ valor_total, credito, deve, pagamento, creditoAtual, faltaAtual, pagamentoAtual, saldoAtual }) {
        if ((creditoAtual !== credito && pagamentoAtual !== pagamento) || !creditoAtual && !pagamentoAtual) {
            const falta = (parseFloat(valor_total) - parseFloat(credito)) + deve
            const saldo = falta > 0 
                ? parseFloat('-'+falta.toString()) + parseFloat(pagamento) 
                : parseFloat(credito) > parseFloat(valor_total) 
                ? (parseFloat(credito) - parseFloat(valor_total)) + parseFloat(pagamento) 
                : falta === 0 && credito === 0 && pagamento === 0 && valor_total === 0
                ? 0
                : parseFloat(pagamento) + parseFloat(saldoAtual ?? 0)

            return { falta: falta < 0 ? 0 : falta, saldo }
        }

        return { falta: faltaAtual, saldo: saldoAtual }
    }

    static async editCreditoParticipante(req, res) {
        try {
            const { id_concurso, id_pf, credito, deve, pagamento } = req.body

            if (!id_concurso || !id_pf) {
                res.status(422).json({ ok: false, message: 'Informe os campos corretamente.' })
                return
            }

            const concurso = await Concurso.pegarConcurso(id_concurso)
            const { total_cotas } = await Concurso.pegarCotasParticipante(id_concurso, id_pf)

            const creditoExiste = await Concurso.pegarCreditoParticipanteConcurso(id_concurso, id_pf)

            const { falta, saldo } = await concursoController.calcularFaltaSaldoParticipante({ 
                valor_total: concurso.valor_cota * total_cotas,
                credito,
                deve,
                pagamento,
                creditoAtual: creditoExiste.credito,
                faltaAtual: creditoExiste.falta,
                pagamentoAtual: creditoExiste.pagamento,
                saldoAtual: creditoExiste.saldo
            })

            const creditoParticipante = new Concurso({ 
                id_concurso, 
                id_pf, 
                credito, 
                deve,
                falta, 
                pagamento, 
                saldo 
            })

            if (creditoExiste.id_pf) {
                await creditoParticipante.editCredito()
            } else {
                await creditoParticipante.saveCredito()
            }

            if (total_cotas) {
                const cota = new Concurso({ id_concurso, id_pf, pago: (pagamento && saldo >= 0) || (!falta && !pagamento) ? 'S' : 'N' })
                await cota.editParticipante()
            }

            res.status(200).json({ ok: true, message: 'Crédito do participante alterado com êxito.' })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }

    static async getConcursos(req, res) {
        try {
            const { tipo, orderCol, orderType } = req.query

            const concursos = await Concurso.pegarConcursos(tipo, orderCol, orderType)

            res.status(200).json({ ok: true, data: { concursos } })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }   

    static async getParticipantesConcurso(req, res) {
        try {
            const { id } = req.params
            const { cotas, status, orderCol, orderType } = req.query

            const participantes = await Concurso.pegarParticipantesConcurso(id, cotas, status, orderCol, orderType)
            const concurso = await Concurso.pegarConcurso(id)

            res.status(200).json({ ok: true, data: { participantes, concurso } })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }

    static async getConcurso(req, res) {
        try {
            const { id } = req.params

            const concurso = await Concurso.pegarConcurso(id)

            res.status(200).json({ ok: true, data: { concurso } })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }

    static async editParticipante(req, res) {
        try {
            const { id_concurso, id_pf, cotas, pago } = req.body

            if (!id_concurso || !id_pf) {
                res.status(422).json({ ok: false, message: 'Informe os campos corretamente.' })
                return
            }

            if (cotas || cotas === 0) {
                const { total_cotas, pago } = await Concurso.pegarCotasParticipante(id_concurso, id_pf)

                const total = cotas > total_cotas ? cotas - total_cotas : total_cotas - cotas

                for(let i = 0; i < total; i++){
                    if (cotas > total_cotas) {
                        const concursoAtual = await Concurso.pegarConcurso(id_concurso)
                        const qtdeCotasConcurso = await Concurso.pegarQtdeCotasConcurso(id_concurso)
                        
                        if (qtdeCotasConcurso < parseInt(concursoAtual.total_cotas)) {
                            const concurso = new Concurso({ id_concurso, id_pf, pago })
                            await concurso.saveCota()                            
                        }
                    } else {
                        const concurso = new Concurso({ id_concurso, id_pf })
                        await concurso.deleteCota()
                    }
                }
            }

            if (pago) {
                const concurso = new Concurso({ id_concurso, id_pf, pago }) 
                await concurso.editParticipante()
            } else {
                const credito = await Concurso.pegarCreditoParticipanteConcurso(id_concurso, id_pf)
                const cota = new Concurso({ id_concurso, id_pf, pago: (credito.pagamento && credito.saldo >= 0) || (!credito.falta && !credito.pagamento) ? 'S' : 'N' })
                await cota.editParticipante()
            }

            res.status(200).json({ ok: true, message: 'Participante alterado com êxito.' })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }

    static async getParticipante(req, res) {
        try {
            const { id_concurso, id_pf } = req.params

            const participante = await Concurso.pegarCotasParticipante(id_concurso, id_pf)

            res.status(200).json({ ok: true, data: { participante: {cotas: participante.total_cotas, status: participante.pago === 'S' ? 'Pago' : participante.total_cotas > 0 ? 'Pendente' : null } }})
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }

    static async getParticipantesHome(req, res) {
        try {
            const { tipo } = req.params

            if (!tipo || (parseInt(tipo) !== 1 && parseInt(tipo) !== 2)) {
                res.status(422).json({ ok: false, message: 'Informe o parâmetro corretamente.' })
                return
            }   

            const novoTipo = parseInt(tipo) === 1 ? 'Lotofácil' : 'Mega-sena'

            const concurso = await Concurso.pegarConcursoRecente(novoTipo)

            const participantes = await Concurso.pegarParticipantesConcursoHome(concurso.id_concurso ?? '')

            const participantesHome = participantes.map(participante => {
                const cpf = createMask(participante.cpf, 'cpf')
                const tel = createMask(participante.tel, 'tel')

                return {
                    ...participante,
                    cpf: participante.cpf ? cpf.replace(cpf.slice(0, 3), '***').replace(cpf.slice(-2), '**') : null,
                    tel: participante.tel ? tel.replace(tel.slice(5, 10), '*****') : null,
                    nome: abbreviateName(participante.nome)
                }
            })

            res.status(200).json({ ok: true, data: { concurso, participantes: participantesHome } })
        } catch (error) {
            res.status(500).json({ ok: false, message: 'Ocorreu um erro na solicitação.' })
        }
    }
}

export default concursoController