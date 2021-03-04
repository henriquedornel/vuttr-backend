module.exports = app => {
    app.post('/signUp', app.api.auth.signUp)
    app.post('/signIn', app.api.auth.signIn)
    app.post('/signInWithGoogle', app.api.auth.signInWithGoogle)
    app.post('/signInWithFacebook', app.api.auth.signInWithFacebook)
    app.post('/validateToken', app.api.auth.validateToken)

    app.route('/users')
        .all(app.config.passport.authenticate()) //se der problema de autenticação, todos os métodos abaixo não serão chamados
        .post(app.api.user.save)
    
    app.route('/users/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.user.getById)
        .put(app.api.user.save)
        .delete(app.api.user.remove)
    
    app.route('/changePassword/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.auth.changePassword)
        
    app.route('/tools')
        .all(app.config.passport.authenticate())
        .get(app.api.tool.get) //por causa do Consign, pode-se passar como parâmatro desta maneira a função que será chamada ao acessar a URL "/tools" usando o método POST do HTTP
        .post(app.api.tool.save)
    
    app.route('/tools/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.tool.getById)
        .put(app.api.tool.save)
        .delete(app.api.tool.remove)
}