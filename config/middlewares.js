const bodyParser = require('body-parser')
const cors = require('cors')

module.exports = app => { //o app (instância do Express) será passado como parâmetro pelo Consign, e servirá como um centralizador de tudo vai ser usado na aplicação
    app.use(bodyParser.json()) //o middleware vai interpretar o JSON que vai vir do corpo da requisição
    app.use(cors())
}