const config = require('../knexfile.js')
const knex = require('knex')(config)

knex.migrate.latest([config]) //para rodar automaticamente até a última migração do Knex ao carregar a aplicação, com "npm start" ou "npm run build" (em sistemas pequenos fazer assim não causa problemas, por não haver preocupações com balanceamento de carga por exemplo)
module.exports = knex //para poder acessar a instância do Knex diretamente no arquivo "index.js"