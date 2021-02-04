const app = require('express')()
const consign = require('consign')

const dotenv = require('dotenv')
dotenv.config()

const db = require('./config/db')
app.db = db //esse db é o knex, passando as configurações de conexão com o banco de dados, para poder usar o app.db para fazer as operações select, insert, update, delete, etc

consign()
    .then('./config/middlewares.js')
    .then('./api/validate.js')
    .then('./api') //carrega todos os outros arquivos dentro da pasta (precisam ser carregados depois de "validate.js", para que eles possam utilizar as funções de estão nesse arquivo)
    .then('./config/routes.js') //as rotas só serão carregadas depois que os arquivos da pasta "api" já tiverem sido carregados
    .into(app) //injeta o app como parâmetro em cada uma das dependências que serão carregadas (o Consign será responsável por passar a aplicação como parâmetro para o arquivo "middlewares.js", para conseguir injetar os middlewares e também as outras dependências dentro da aplicação)

app.listen(process.env.PORT || 3000)