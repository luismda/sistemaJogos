import axios from 'axios'

const api = axios.create({ baseURL: 'https://jogos.adilsonfaria.com.br/api' })

api.defaults.headers.post['Access-Control-Allow-Origin'] = '*'

export default api