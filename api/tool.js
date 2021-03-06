module.exports = app => { //retorna uma função arrow que recebe como parâmetro o app, que representa a instância do Express do "index.js", que é passado para todas as dependências que foram declaradas no then do Consign
    const { checkNotEmpty, checkNotExists/*, checkEquals*/ } = app.api.validate
    
    const get = async (req, res) => { //trazer todas as ferramentas
        const page = req.query.page || 1 //a página é passada como parâmetro da requisição (pega a página 1 como padrão)

        let conditions = ''
        if(req.query.tag && req.query.tag.trim() !== '') {
            conditions = `LOWER('${req.query.tag.trim()}') = ANY("tags")`
        } else if(req.query.search && req.query.search.trim() !== '') {
            conditions = `LOWER("title") LIKE LOWER('%${req.query.search.trim()}%') OR
                LOWER("description") LIKE LOWER('%${req.query.search.trim()}%') OR
                LOWER('${req.query.search.trim()}') = ANY("tags")`
        }

        const result = await app.db('tools')
            .where({ userId: req.user.id }).whereRaw(conditions)
            .count('*').first()
            .catch(err => res.status(500).send(err)) //quantidade total de ferramentas no banco de dados
        const count = parseInt(result.count)
        const limit = req.query.limit || count

        await app.db('tools').where({ userId: req.user.id })
            .whereRaw(conditions)//.where({ title: 'teste' })
            .limit(limit).orderBy('id')
            .offset(page * limit - limit) //deslocamento necessário para trazer os dados paginados
            .then(tools => res.json(tools)) //caso os nomes dos campos no banco de dados seguissem o padrão under_scores, aqui seria necessário fazer um map para converter para o padrão camelCase, para ser compatível com o padrão REST e com as nomenclaturas do frontend
            .catch(err => res.status(500).send(err)) //erro do lado do servidor
    }

    const getById = async (req, res) => { //trazer uma ferramenta específica
        await app.db('tools')
            .where({ id: req.params.id, userId: req.user.id })
            .first()
            .then(tool => res.json(tool))
            .catch(err => res.status(500).send(err))
    }

    const save = async (req, res) => { //função middleware que recebe como parâmetro a requisição e a resposta
        //const tool = {  ...req.body } //um JSON mandado no corpo da requisição é interceptado pelo body parser. Através do operador spread, todos os atributos que vieram no body serão espalhados e colocados no objeto tool
        const tool = { //dessa forma, só vai receber os campos que de fato forem ser persistidos no banco de dados
            title: req.body.title,
            link: req.body.link,
            description: req.body.description,
            tags: req.body.tags,
            userId: req.user.id
        }
        if(req.params.id) {
            tool.id = req.params.id //quando for um update, pega o id da ferramenta que foi passado como parâmetro da requisição
        }

        try {
            checkNotEmpty(tool.title, 'messages.tool.titleRequired')
            checkNotEmpty(tool.link, 'messages.tool.linkRequired')

            let toolFromDB
            if(!tool.id) { //se for uma inserção
                toolFromDB = await app.db('tools')
                    .where({ userId: tool.userId })
                    .whereRaw('LOWER(title) = ?', tool.title.toLowerCase())
                    .first()
                    .catch(err => res.status(500).send('err')) //erro do lado do servidor
            } else { //update
                toolFromDB = await app.db('tools')
                    .where({ userId: tool.userId })
                    .whereRaw('LOWER(title) = ?', tool.title.toLowerCase())
                    .where('id', '<>', tool.id).first()
                    .catch(err => res.status(500).send(err)) //erro do lado do servidor
            }
            checkNotExists(toolFromDB, 'messages.tool.exists')
        } catch(msg) {
            return res.status(400).send(msg) //erro do lado do cliente
        }

        if(tool.id) { //update
            await app.db('tools')
                .update(tool)
                .where({ id: tool.id, userId: tool.userId })
                .then(_ => res.status(200).send()) //não ocorreu nenhum erro
                .catch(err => res.status(500).send(err)) //erro do lado do servidor
        } else { //insert
            await app.db('tools')
                .insert(tool)
                .then(_ => res.status(201).send()) //não ocorreu nenhum erro
                .catch(err => res.status(500).send(err)) //erro do lado do servidor
        }

    }

    const remove = async (req, res) => {        
        try {
            const deletedTool = await app.db('tools')
                .where({ id: req.params.id, userId: req.user.id })
                .del()
            try {
                checkNotEmpty(deletedTool, 'messages.tool.notFound')
            } catch(msg) {
                return res.status(400).send(msg) //erro do lado do cliente
            }
            res.status(204).send() //não ocorreu nenhum erro
        } catch (msg) {
            res.status(500).send(msg) //erro do lado do servidor
        }
    }
            
    return { get, getById, save, remove } //objeto com todas as funções a serem retornadas
}