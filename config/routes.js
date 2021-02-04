module.exports = app => {
    app.route('/tools')
        .get(app.api.tool.get) //por causa do Consign, pode-se passar como parâmatro desta maneira a função que será chamada ao acessar a URL "/tools" usando o método POST do HTTP
        .post(app.api.tool.save)
    
    app.route('/tools/:id')
        .get(app.api.tool.getById)
        .put(app.api.tool.save)
        .delete(app.api.tool.remove)
}