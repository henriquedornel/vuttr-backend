const passport = require('passport')
const passportJwt = require('passport-jwt')
const { Strategy, ExtractJwt } = passportJwt

const dotenv = require('dotenv')
dotenv.config()
const authSecret = process.env.AUTH_SECRET

module.exports = app => { //module.exports retorna uma função que recebe "app" como parâmetro
    const params = { //parâmetros específicos para a estratégia
        secretOrKey: authSecret, //segredo
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() //token JWT extraído a partir do cabeçalho da requisição; "do cabeçalho de autenticação como token do portador"
    }

    const strategy = new Strategy(params, (payload, done) => { //serão passados os parâmetros definidos anteriormente, e uma função callback que vai receber o payload (o mesmo definido no signIn) e a função "done"
        app.db('users')
            .where({ id: payload.id }) //o usuário é obtido a partir do id presente no payload
            .first()
            .then(user => done(null, user ? { ...payload } : false)) //o primeiro parâmetro null é o erro. Se o user estiver setado, vai pegar o payload e colocar dentro da requisição, e vai retornar falso se o usuário não estiver setado
            .catch(err => done(err, false)) //se cair no catch, vai passar a mensagem de erro e dizer que a validação retornou false
    })

    passport.use(strategy)

    return { //vai filtrar as requisições e não permitir que as requisições sejam feitas em cima dos endpoints que precisam passar pelo passport (precisam ter um usuário logado)
        authenticate: () => passport.authenticate('jwt', { session: false }) //o parâmetro "jwt" é a estratégia, e não haverá controle de sessão associado a essa autenticação
    }
}