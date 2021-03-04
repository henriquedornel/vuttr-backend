const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const { checkNotEmpty, checkNotExists, checkEmail } = app.api.validate

    const getById = async (req, res) => { //trazer um usuário específico
        await app.db('users')
            .select('id', 'firstname', 'lastname', 'email')
            .where({ id: req.params.id })
            .first()
            .then(user => res.json(user))
            .catch(err => res.status(500).send(err))
    }

    const save = async (req, res) => {
        const user = await app.db('users')
            .where({ id: req.params.id }).first()
            .catch(err => res.status(500).send(err)) //erro do lado do servidor
        if(!user) return res.status(400).send('messages.user.notFound')

        user.firstname = req.body.firstname
        user.lastname = req.body.lastname
        if(user.loginType === 'internal') {
            user.email = req.body.email
        }

        try {
            checkNotEmpty(user.firstname, 'messages.user.firstnameRequired')
            checkNotEmpty(user.email, 'messages.user.emailRequired')
            checkEmail(user.email, 'messages.user.emailInvalid')

            const userFromDB = await app.db('users')
                .whereRaw('LOWER(email) = ?', user.email.toLowerCase())
                .where('id', '<>', user.id).first()
                .catch(err => res.status(500).send(err)) //erro do lado do servidor
            checkNotExists(userFromDB, 'messages.user.exists')
        } catch(msg) {
            return res.status(400).send(msg) //erro do lado do cliente
        }

        await app.db('users')
            .update(user)
            .where({ id: user.id })
            .then(_ => res.status(204).send()) //não ocorreu nenhum erro e não retornou nenhum dado
            .catch(err => res.status(500).send(err)) //erro do lado do servidor
    }

    const remove = async (req, res) => {        
        try {
            await app.db('tools')
                .where({ userId: req.params.id })
                .del()
            const deletedUser = await app.db('users')
                .where({ id: req.params.id })
                .del()
            try {
                checkNotEmpty(deletedUser, 'messages.user.notFound')
            } catch(msg) {
                return res.status(400).send(msg) //erro do lado do cliente
            }
            res.status(204).send() //não ocorreu nenhum erro*/
        } catch (msg) {
            res.status(500).send(msg) //erro do lado do servidor
        }
    }

    return { getById, save, remove }
}