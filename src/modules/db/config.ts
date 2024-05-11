import { Sequelize } from 'sequelize'
import dotenv from "dotenv";
dotenv.config();

const dbName = process.env.DB_NAME
const dbUser = process.env.DB_USER
const dbHost = process.env.DB_HOST
const dbPort = process.env.DB_PORT
const dbPassword = process.env.DB_PASSWORD

// 'postgres://user:pass@example.com:5432/dbname'
const sequelizeConnection = new Sequelize(`postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`)

export default sequelizeConnection