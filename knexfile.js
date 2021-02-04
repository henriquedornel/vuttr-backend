module.exports = {  
    client: 'pg',
    connection: process.env.DATABASE_URL + process.env.DATABASE_URL_OPTIONS,
    migrations: {
      	tableName: 'knex_migrations'
    }
};
