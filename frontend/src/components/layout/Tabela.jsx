import { useState } from 'react'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'
import { Dropdown } from 'react-bootstrap'
import Input from '../layout/Input'
import tabelaStyles from '../../styles/components/Tabela.module.css'
import mask from '../../utils/mask'

function Tabela({ cor, colunas, dados, propriedades, fixedHeader, notAuthenticated, contagem, ordenacao, dropdown, options, onChangeFuncs, onSubmitFuncs, className }) {
    const [order, setOrder] = useState({})

    const handleChangeOrderColumns = col => {
        const newOrder = { 
            col: col === 'Nome da conta' 
                ? 'complemento' 
                : col === 'Tel.'
                ? 'tel'
                : col === 'Concurso' 
                ? 'numero'
                : col === 'Prêmio'
                ? 'premio'
                : col === 'Valor'
                ? 'valor_cota'
                : col === 'Cont.'
                ? 'contagem'
                : col.toLowerCase(), 
            type: !order.type 
                ? 'DESC' 
                : order.type === 'DESC' 
                ? 'ASC' 
                : 'DESC' 
        }

        setOrder(newOrder)

        ordenacao(newOrder)
    }
    
    return dados.length ? (
        <table className={ `${tabelaStyles.tabela} ${tabelaStyles[cor]} ${fixedHeader ? tabelaStyles.table_fixed_header : ''} ${className}` }>
            <thead>
                <tr>
                    {contagem && <th></th>}
                    {colunas.map((col, index) => (
                        ordenacao ? (
                            <th key={index} onClick={() => { handleChangeOrderColumns(col) }} style={{cursor: 'pointer'}}>
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    {col === '' ? (<label className={ tabelaStyles.label_check }><input type='checkbox' data='0' /><span></span></label>) : col}
                                    <FaArrowUp style={{color: '#ccc', fontSize: '12px', margin: '0 2px 0 2px'}} />
                                    <FaArrowDown style={{color: '#ccc', fontSize: '12px', margin: '0 2px 0 2px'}} />
                                </div>
                            </th>
                        ) : (
                            <th key={index}>
                                {col === '' ? (<label className={ tabelaStyles.label_check }><input type='checkbox' data='0' /><span></span></label>) : col}
                            </th>
                        )
                    ))}
                    {dropdown && <th></th>}
                </tr>
            </thead>
            <tbody>
                {dados.map((dado, index) => (
                    <tr key={index}>
                        {contagem && (
                            <td key={index+1}>
                                <span className='badge d-flex justify-content-center align-items-center' style={ {backgroundColor: cor === 'roxo' ? '#7144b9' : cor === 'verde' ? '#00a884' : '#0079bf', width: '22px', height: '22px'} }>{index+1}</span>
                            </td>
                        )}
                        {propriedades.map((prop, indexProp) => (
                            <td 
                                key={indexProp}
                            >
                                {colunas[indexProp] === '' 
                                    ? (<label className={ tabelaStyles.label_check }><input type='checkbox' data={dado[prop]} /><span></span></label>) 
                                    : (prop === 'falta' || prop === 'saldo') && !dado[prop]
                                    ? 0
                                    : prop === 'credito' || prop === 'pagamento' || prop === 'deve'
                                    ? <form onSubmit={onSubmitFuncs.handleSubmitCreditos} data={dado[Object.keys(dado)[0]]}><Input className={tabelaStyles.input_creditos} type="text" name={prop} data={dado[Object.keys(dado)[0]]} value={dado[prop] ?? 0} onBlur={onSubmitFuncs.handleSubmitCreditos} onChange={onChangeFuncs.handleChangeCreditos} /></form>
                                    : !dado[prop] && dado[prop] !== 0 && dado[prop] !== ''
                                    ? '-' 
                                    : (prop === 'cpf' || prop === 'tel') && !notAuthenticated
                                    ? mask(dado[prop], prop === 'cpf' ? 'cpf' : 'tel')
                                    : dado[prop] === 'S'
                                    ? <span className='badge' style={ {backgroundColor: cor === 'roxo' ? '#7144b9' : cor === 'verde' ? '#00a884' : '#0079bf'} }>Sim</span>
                                    : dado[prop] === 'N'
                                    ? <span className='badge bg-danger'>Não</span>
                                    : prop === 'valor_cota' || prop === 'premio'
                                    ? parseFloat(dado[prop]).toLocaleString('pt-br', {style: 'currency', currency: 'BRL'})
                                    : prop === 'total_cotas' || dado[prop] === 'Ativo' || (prop === 'cotas' && notAuthenticated)
                                    ? <span className='badge' style={ {backgroundColor: cor === 'roxo' ? '#7144b9' : cor === 'verde' ? '#00a884' : '#0079bf'} }>{dado[prop]}</span>
                                    : dado[prop] === 'Adiado'
                                    ? <span className='badge bg-warning'>{dado[prop]}</span>
                                    : dado[prop] === 'Cancelado'
                                    ? <span className='badge bg-danger'>{dado[prop]}</span>
                                    : dado[prop] === 'Concluído'
                                    ? <span className='badge bg-success'>{dado[prop]}</span>
                                    : dado[prop] === 'Pago'
                                    ? <span className={`badge ${tabelaStyles.badge_click}`} data={`${dado[Object.keys(dado)[0]]}|pago`} onClick={onChangeFuncs.handleChangeStatus} style={ {backgroundColor: cor === 'roxo' ? '#7144b9' : cor === 'verde' ? '#00a884' : '#0079bf'} }>{dado[prop]}</span>
                                    : dado[prop] === 'Pendente'
                                    ? <span className={`badge bg-danger ${tabelaStyles.badge_click}`} data={`${dado[Object.keys(dado)[0]]}|pendente`} onClick={onChangeFuncs.handleChangeStatus}>{dado[prop]}</span>
                                    : prop === 'cotas' && !notAuthenticated
                                    ? <Input className={`${tabelaStyles.input_cotas} mb-0`} type='number' name='cotas' min='0' data={dado[Object.keys(dado)[0]]} value={dado[prop]} onChange={onChangeFuncs.handleChangeCotas} />
                                    : prop === 'complemento'
                                    ? dado[prop]?.split(',')?.map((comp, index) => <span key={index} className='badge me-1' style={ {backgroundColor: cor === 'roxo' ? '#7144b9' : cor === 'verde' ? '#00a884' : '#0079bf'} }>{comp}</span>) ?? '-'
                                    : dado[prop]}
                            </td>
                        ))}

                        {dropdown && (
                            <td key={index}>
                                <Dropdown>
                                    <Dropdown.Toggle className={`${tabelaStyles.btn_dropdown} ${cor}`} id="dropdown-basic"></Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        {options.map(({ item, action }, index) => (
                                            <Dropdown.Item key={index} className={cor} data={dado[Object.keys(dado)[0]]} onClick={action}>{item}</Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    {contagem && <th></th>}
                    {colunas.map((col, index) => (
                        <th key={index}>{col}</th>
                    ))}
                    {dropdown && <th></th>}
                </tr>
            </tfoot>
        </table>
    ) : (
        <p className='mt-5 text-center'>Nenhum registro encontrado.</p>
    ) 
}

export default Tabela