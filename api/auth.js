const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

const dotenv = require('dotenv')
dotenv.config()
const authSecret = process.env.AUTH_SECRET

module.exports = app => {
    const { checkNotEmpty, checkNotExists, checkEquals, checkEmail, checkPassword } = app.api.validate

    const signup = async (req, res) => {
        const user = { ...req.body } //objeto gerado pelo body-parser

        try {
            checkNotEmpty(user.firstname, 'messages.user.firstnameRequired')
            checkNotEmpty(user.email, 'messages.user.emailRequired')
            checkEmail(user.email, 'messages.user.emailInvalid')
            checkNotEmpty(user.password, 'messages.user.passwordRequired')
            checkNotEmpty(user.passwordConfirmation, 'messages.user.passwordConfirmationRequired')
            checkEquals(user.password, user.passwordConfirmation, 'messages.user.passwordConfirmationMatch')
            checkPassword(user.password, 'messages.user.passwordInvalid')

            const userFromDB = await app.db('users').where({ email: user.email })
                .first().catch(err => res.status(500).send(err)) //erro do lado do servidor
            checkNotExists(userFromDB, 'messages.user.exists')
        } catch(msg) {
            return res.status(400).send(msg) //erro do lado do cliente
        }

        user.password = encryptPassword(user.password)
        delete user.passwordConfirmation //a confirmação não será inserida no banco de dados

        app.db('users')
            .insert(user)
            .then(_ => res.status(204).send()) //não ocorreu nenhum erro e não retornou nenhum dado
            .catch(err => res.status(500).send(err)) //erro do lado do servidor
    }

    const signin = async (req, res) => {
        if(!req.body.email || !req.body.password) {
            return res.status(400).send('messages.user.emailPasswordRequired')
        }

        const user = await app.db('users')
            .where({ email: req.body.email }).first()
            .catch(err => res.status(500).send(err)) //erro do lado do servidor

        if(!user) return res.status(400).send('messages.user.notFound')

        const isMatch = bcrypt.compareSync(req.body.password, user.password) //verifica se a senha informada é equivalente à senha criptografada armazenada no banco de dados
        if(!isMatch) return res.status(401).send('messages.user.passwordIncorrect') //código de erro para acesso não autorizado

        //o token terá uma validade, que será gerada a partir da data atual
        //Date.now() -> quantidade de milissegundos desde 01/01/1970
        //Date.now() / 1000 -> quantidade de segundos desde 01/01/1970 (valor quebrado)
        //Math.floor(Date.now() / 1000) -> quantidade de segundos desde 01/01/1970 (valor inteiro)
        const now = Math.floor(Date.now() / 1000)

        const payload = { //conteúdo para gerar o token JWT
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            iat: now, //issued at (emitido em)
            exp: now + (60 * 60 * 24 * 3) //token será válido por 3 dias (pode fechar o browser que não vai precisar se logar novamente)
        }

        res.json({ //resposta que será enviada para o usuário
            ...payload,
            token: jwt.encode(payload, authSecret)
        }) //no momento em que isso for respondido para o usuário, o token será mandado pra ele, e qualquer nova requisição que for feita precisará conter um cabeçalho authorization. No frontend, esse token será armazenado no localStorage, e precisará fazer parte de toda nova requisição, pra dizer pro backend que ele tem um token válido (a API entregará conteúdo mediante uma prova de que o usuário está logado)
    }

    const changePassword = async (req, res) => {
        try {
            checkNotEmpty(req.body.passwordOld, 'messages.user.passwordOldRequired')
            checkNotEmpty(req.body.passwordNew, 'messages.user.passwordNewRequired')
            checkNotEmpty(req.body.passwordNewConfirmation, 'messages.user.passwordConfirmationRequired')
            checkEquals(req.body.passwordNew, req.body.passwordNewConfirmation, 'messages.user.passwordNewConfirmationMatch')
            checkPassword(req.body.passwordNew, 'messages.user.passwordNewInvalid')
        } catch(msg) {
            return res.status(400).send(msg) //erro do lado do cliente
        }

        const user = await app.db('users')
            .where({ id: req.params.id }).first()
            .catch(err => res.status(500).send(err)) //erro do lado do servidor
        if(!user) return res.status(400).send('messages.user.notFound')

        const isMatch = bcrypt.compareSync(req.body.passwordOld, user.password) //verifica se a senha informada é equivalente à senha criptografada armazenada no banco de dados
        if(!isMatch) return res.status(401).send('messages.user.passwordOldIncorrect') //código de erro para acesso não autorizado

        user.password = encryptPassword(req.body.passwordNew)
        
        app.db('users')
            .update(user)
            .where({ id: user.id })
            .then(_ => res.status(204).send()) //não ocorreu nenhum erro e não retornou nenhum dado
            .catch(err => res.status(500).send(err)) //erro do lado do servidor
    }

    const validateToken = async (req, res) => {
        const userData = req.body || null

        try {
            if(userData) {
                const token = jwt.decode(userData.token, authSecret) //decodificação do token, utilizando o authSecret
                if(new Date(token.exp * 1000) > new Date()) { //verifica se o token ainda está válido (no JavaScript o tempo é em milissegundos, e o no token o tempo é em segundos)
                    return res.send(true) //aqui poderíamos também renovar o token do usuário
                }
            }
        } catch(e) {
            // problema com o token (vai cair aqui por exemplo se o token for gerado com um authSecret diferente, que tenha vazado indevidamente mas seja antigo)
        }

        res.send(false)
    }

    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10) //salt = tempero; o hash gerado será diferente para a mesma senha
        return bcrypt.hashSync(password, salt) //gera o hash da senha de forma síncrona
    }

    return { signup, signin, changePassword, validateToken }
}