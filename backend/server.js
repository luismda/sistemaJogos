import app from './app.js'
import connection from './db/connection.js'
import { config } from 'dotenv'
config()

app.set('port', process.env.PORT || 3007)

connection.sync()
    .then(() => app.listen(app.get('port')))
    .catch(error => console.error(error))