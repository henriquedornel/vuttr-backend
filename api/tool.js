module.exports = app => { //retorna uma função arrow que recebe como parâmetro o app, que representa a instância do Express do "index.js", que é passado para todas as dependências que foram declaradas no then do Consign
    const { checkNotEmpty, checkNotExists } = app.api.validate
    
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

        const result = await app.db('tools').whereRaw(conditions)
            .count('*').first()
            .catch(err => res.status(500).send(err)) //quantidade total de ferramentas no banco de dados
        const count = parseInt(result.count)
        const limit = req.query.limit || count

        app.db('tools').whereRaw(conditions)
            .limit(limit).orderBy('id').offset(page * limit - limit) //deslocamento necessário para trazer os dados paginados
            .then(tools => res.json(tools))
            .catch(err => res.status(500).send(err)) //erro do lado do servidor
    }

    const getById = (req, res) => { //trazer uma ferramenta específica
        app.db('tools')
            .where({ id: req.params.id })
            .first()
            .then(tool => res.json(tool))
            .catch(err => res.status(500).send(err))
    }

    const save = async (req, res) => { //função middleware que recebe como parâmetro a requisição e a resposta
        //const tool = {  ...req.body } //um JSON mandado no corpo da requisição é interceptado pelo body parser. Através do operador spread, todos os atributos que vieram no body serão espalhados e colocados no objeto tool
        const tool = { //dessa forma, só vai receber os campos que de fato forem ser persistidos no banco de dados
            id: req.body.id,
            title: req.body.title,
            link: req.body.link,
            description: req.body.description,
            tags: req.body.tags
        }
        if (req.params.id) {
            tool.id = req.params.id //quando for um update, pega o id da ferramenta que foi passado como parâmetro da requisição
        }

        try {
            checkNotEmpty(tool.title, 'Tool title is required')
            checkNotEmpty(tool.link, 'Tool link is required')

            let toolFromDB
            if(!tool.id) { //se for uma inserção
                toolFromDB = await app.db('tools')
                    .whereRaw('LOWER(title) = ?', tool.title.toLowerCase()).first()
                    .catch(err => res.status(500).send(err)) //erro do lado do servidor
            } else { //update
                toolFromDB = await app.db('tools')
                    .whereRaw('LOWER(title) = ?', tool.title.toLowerCase())
                    .where('id', '<>', tool.id).first()
                    .catch(err => res.status(500).send(err)) //erro do lado do servidor
            }
            checkNotExists(toolFromDB, `There is already another tool called "${tool.title}"`)
        } catch(msg) {
            return res.status(400).send(msg) //erro do lado do cliente
        }

        if(tool.id) { //update
            app.db('tools')
                .update(tool)
                .where({ id: tool.id })
                .then(_ => res.status(200).send()) //não ocorreu nenhum erro
                .catch(err => res.status(500).send(err)) //erro do lado do servidor
        } else { //insert
            app.db('tools')
                .insert(tool)
                .then(_ => res.status(201).send()) //não ocorreu nenhum erro
                .catch(err => res.status(500).send(err)) //erro do lado do servidor
        }

    }

    const remove = async (req, res) => {
        try {
            const deletedRows = await app.db('tools').where({ id: req.params.id }).del()
            try {
                checkNotEmpty(deletedRows, 'Tool not found')
            } catch(msg) {
                return res.status(400).send(msg) //erro do lado do cliente
            }
            res.status(204).send() //não ocorreu nenhum erro
        } catch (msg) {
            res.status(50).send(msg) //erro do lado do servidor
        }
    }
            
    return { get, getById, save, remove } //objeto com todas as funções a serem retornadas
}