import { Sequelize } from 'sequelize'
import { config } from 'dotenv'
config()

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    query: { raw: true },
    timezone: '-03:00'
})

try {
    sequelize.authenticate()
} catch (error) {
    console.error(error)
}

export default sequelize