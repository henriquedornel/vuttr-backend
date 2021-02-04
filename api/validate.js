module.exports = app => {
    function checkNotEmpty(value, msg) { //se o valor estiver vazio não vai acontecer nada, se o valor não existir vai dar erro
        if(!value) throw msg //se o valor não estiver setado, vai ser lançada uma mensagem de erro
        if(Array.isArray(value) && value.length === 0) throw msg //verifica se o valor é um array vazio
        if(typeof value === 'string' && !value.trim()) throw msg //verifica se o valor é uma string vazia
    }
    
    function checkNotExists(value, msg) { //se o valor não existir não vai acontecer nada, se o valor existir vai dar erro (é exatamente o contrário do comportamento da função anterior)
        try {
            checkNotEmpty(value, msg)
        } catch(msg) {
            return
        }
        throw msg
    }

    return { checkNotEmpty, checkNotExists }
}