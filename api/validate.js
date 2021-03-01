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

    function checkEquals(valueA, valueB, msg) {
        if(valueA !== valueB) throw msg
    }

    function checkEmail(value, msg) {
        const regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
        
        if(!regex.test(value)) {
            throw msg
        }
    }

    function checkPassword(value, msg) {
        if(value.length < 8) {
            throw msg
        }
    }

    return { checkNotEmpty, checkNotExists, checkEquals, checkEmail, checkPassword }
}