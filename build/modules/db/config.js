import { Sequelize } from 'sequelize';
const dbName = 'LemonTube';
const dbUser = 'root';
const dbHost = 'localhost';
const dbPort = 5433;
const dbPassword = '1234567';
const sequelizeConnection = new Sequelize(`postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`);
export default sequelizeConnection;
//# sourceMappingURL=config.js.map