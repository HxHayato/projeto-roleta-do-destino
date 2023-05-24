//Ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    criarOpcoesSelect()
})

//Abrir e fechar select
let dropdownSelect = document.querySelector('.dropdown-select') 
let select = document.querySelector('.select')
let opcaoEscolhida = document.querySelector('.escolhido')
let seta = document.querySelector('.bxs-down-arrow')
let menuOpcoes = document.querySelector('.outras')
let opcoes = document.querySelectorAll('.opcoes')

dropdownSelect.addEventListener('click', (e) => {
    abrirOpcoes()
})

function abrirOpcoes () {
    if(seta.classList.contains('virar')){
        //se já foi virada antes
        seta.classList.remove('virar')
        seta.classList.add('desvirar')

        //Fecha as opções
        menuOpcoes.classList.remove('aberto')
        menuOpcoes.classList.add('fechado') 

        dropdownSelect.style.borderRadius = '3px'
    } else if (seta.classList.contains('desvirar')){
        //se já foi desvirada antes
        seta.classList.remove('desvirar')
        seta.classList.add('virar')

        //Abre as opções
        menuOpcoes.classList.remove('fechado')
        menuOpcoes.classList.add('aberto')

        dropdownSelect.style.borderRadius = '3px 3px 0 0'
    } else {
        //se for a primeira vez
        seta.classList.add('virar')
        menuOpcoes.classList.add('aberto')
        dropdownSelect.style.borderRadius = '3px 3px 0 0'
    }
}

//quando clicar em um botao
opcoes.forEach(opcao => {
    opcao.addEventListener('click', (e) => {
        let opcaoAtiva = document.querySelector('.ativo')

        if(opcao.dataset.value != opcaoEscolhida.dataset.value){
            opcaoAtiva.classList.remove('ativo')
            opcao.classList.add('ativo')
            opcaoEscolhida.dataset.value = opcao.dataset.value
            opcaoEscolhida.textContent = opcao.textContent
        }

        abrirOpcoes()
    })
})

//Criando a estrutura das opções do select, que serão chamadas ao carregar a página
function criarEstruturaOption (regiao) {
    let menuOpcoesSelect = document.querySelector('.outras')
    let verificaOpcoes = menuOpcoesSelect.querySelector('.ativo')
    let opcao = document.createElement('span')

    opcao.setAttribute('data-value', regiao)
    opcao.classList.add('opcoes')
    opcao.textContent = regiao

    if(verificaOpcoes == null){
        opcao.classList.add('ativo')

        //Colocando essa opcao no campo principal
        opcaoEscolhida.textContent = opcao.textContent
        opcaoEscolhida.dataset.value = opcao.dataset.value
    }

    menuOpcoesSelect.appendChild(opcao)
}


//Menu mobile
let botaoMenuMobile = document.querySelector('.icon-menu-mobile')
let icon = botaoMenuMobile.querySelector('.bx')
let navListMobile = document.querySelector('.navbar-mobile')
let contMenu = 0

botaoMenuMobile.addEventListener('click', (e) => {
    if(contMenu == 0) {
        icon.classList.remove('bx-menu')
        icon.classList.add('bx-x')

        navListMobile.style.height = 'auto'
        contMenu++
    } else {
        icon.classList.add('bx-menu')
        icon.classList.remove('bx-x')

        navListMobile.style.height = '0'

        contMenu--
    }
})

//Mudar entre grade e lista
function alterarResultado () {
    let botaoAlterar = document.querySelector('.alterar-resultado')
    let verifLocalStorage = localStorage.getItem('modo-resultado')
    let icone = botaoAlterar.querySelector('.bx')
    let listaSorteado = document.querySelector('.lista-sorteados')
    let li = document.querySelector('.raca-vezes')

    if(verifLocalStorage == 'lista' || verifLocalStorage == null) {
        //Troca icone
        icone.classList.remove('bxs-grid-alt')
        icone.classList.add('bx-list-ul')
        icone.ariaLabel = 'Mudar modo de apresentação de resultados para lista'

        //Trocar para grade
        listaSorteado.classList.toggle('grade')

        localStorage.setItem('modo-resultado', 'grade')

    } else if(verifLocalStorage == 'grade' ){
        //Troca icone
        icone.classList.remove('bx-menu')
        icone.classList.add('bxs-grid-alt')
        icone.ariaLabel = 'Mudar modo de apresentação de resultados para grade'

        //Trocar para grade
        listaSorteado.classList.toggle('grade')

        localStorage.setItem('modo-resultado', 'lista')
    }
}

//Começando a ler o JSON
async function criarOpcoesSelect () {
    try {
        let roletas = await fetch('roletas.json')
        let dados = await roletas.json()

        for await (const objeto of dados){
            criarEstruturaOption(objeto.regiao)
        }
    } catch (error) {
        console.log(`Erro ao ler o arquivo: ${error}`)
    }
}

//Sorteando as raças
let botaoSortear = document.querySelector('.sortear')

botaoSortear.addEventListener('click', (e) => {
    let numVezes = document.getElementById('nVezes').value

    if(numVezes.length > 0 && numVezes > 0) {
        sortearRaca()
    } else {
        let modal = document.querySelector('.modal')

        modal.classList.toggle('ativo')
        setTimeout(() => {
            modal.classList.toggle('ativo')
        }, 2000);
    }
})

//Permite o sorteio ao apertar Enter
document.addEventListener('keypress', e => {
    if (e.key == 'Enter') {
        let numVezes = document.getElementById('nVezes').value

        if(numVezes.length > 0 && numVezes > 0) {
            sortearRaca()
        } else {
            let modal = document.querySelector('.modal')

            modal.classList.toggle('ativo')
            setTimeout(() => {
                modal.classList.toggle('ativo')
            }, 2000);
        }
    }
})

async function sortearRaca () {
    try {
        const numVezes = document.getElementById('nVezes').value
        const response = await fetch('roletas.json')
        const dados = await response.json()
        const index = dados.findIndex(roleta => roleta.regiao == opcaoEscolhida.dataset.value)

        if(index != null) {
            let i = 0
            let array = []

            //Populando o array com o nome das raças
            while(i < numVezes){
                array[i] = acharRacaSorteada(dados[index].roletas)
                i++
            }

            //O array tem o nome das raças
            mostrarResultado(array)
        } else {
            console.log('Erro')
        }
        
    } catch (error) {
        console.log(`Erro ao sortear raça: ${error}`)
    }
}

function acharRacaSorteada (array) {
    let contador = 0

    while (contador < array.length ) {
        //calcula um número aleatório tendo o range máximo 0 e o tamanho da roleta do array, cada roleta pode ter números independentes e vai dar certo
        let indiceAleatorio = Math.floor(Math.random()*array[contador].objetos.length)
        let roletas = array[contador].objetos

        if(roletas[indiceAleatorio].raca == `ROLETA ${contador+2}`) {
            contador++
        } else {
            contador += array.length
            return roletas[indiceAleatorio].raca
        }
    }
}

function mostrarResultado (array) {
    let resultado = document.querySelector('.resultado')

    //resetando o valor do resultado
    resultado.innerHTML = ''

    //Criando a parte de cima dos resultados
    let divTituloBotoes = document.createElement('div')
    divTituloBotoes.classList.add('div-titulo-botoes')
    resultado.appendChild(divTituloBotoes)

    let h2Titulo = document.createElement('h2')
    h2Titulo.classList.add('titulo-resultado')
    h2Titulo.textContent = 'O destino decidiu:'
    divTituloBotoes.appendChild(h2Titulo)
    
    let divBotoes = document.createElement('div')
    divBotoes.classList.add('botoes-resultado')
    divTituloBotoes.appendChild(divBotoes)

    let botaoGradeLista = document.createElement('button')
    botaoGradeLista.classList.add('alterar-resultado')
    divBotoes.appendChild(botaoGradeLista)
    botaoGradeLista.addEventListener('click', (e) => {
        alterarResultado()
    })

    let iconeGradeLista = document.createElement('i')
    iconeGradeLista.classList.add('bx')
    //O atributo de lista ou grade está mais abaixo
    botaoGradeLista.appendChild(iconeGradeLista)

    let botaoCopiar = document.createElement('button')
    botaoCopiar.classList.add('copiar')
    divBotoes.appendChild(botaoCopiar)

    let iconCopiar = document.createElement('i')
    iconCopiar.classList.add('bx')
    iconCopiar.classList.add('bxs-copy')
    iconCopiar.setAttribute('aria-label', 'Copiar resultado')
    botaoCopiar.appendChild(iconCopiar)

    //Lista de raças
    let ulListaSorteado = document.createElement('ul')
    ulListaSorteado.classList.add('lista-sorteados')
    resultado.appendChild(ulListaSorteado)

    let sorteados = verificarRepetidos(array)

    sorteados.forEach(raca => {
        let liRacaVezes = document.createElement('li')
        liRacaVezes.classList.add('raca-vezes')
        ulListaSorteado.appendChild(liRacaVezes)

        let pRaca = document.createElement('p')
        pRaca.classList.add('raca')
        pRaca.textContent = raca.nome
        liRacaVezes.appendChild(pRaca)

        let spanVezes = document.createElement('span')
        spanVezes.classList.add('vezes')
        liRacaVezes.appendChild(spanVezes)

        let spanNumeroVezes = document.createElement('span')
        spanNumeroVezes.classList.add('numero-vezes')
        spanVezes.appendChild(spanNumeroVezes)
        spanNumeroVezes.textContent = raca.repeticoes

        spanVezes.textContent += 'x'
    })

    //Verifica a preferência do usuário
    if(localStorage.getItem('modo-resultado')){
        let modo = localStorage.getItem('modo-resultado')

        if(modo == 'lista') {
            iconeGradeLista.classList.add('bxs-grid-alt')
            iconeGradeLista.setAttribute('aria-label', 'Mudar modo de apresentação de resultados para grade')
        } else {
            iconeGradeLista.classList.add('bx-list-ul')
            iconeGradeLista.setAttribute('aria-label', 'Mudar modo de apresentação de resultados para lista')
            ulListaSorteado.classList.add('grade')
        }
    } else {
        iconeGradeLista.classList.add('bxs-grid-alt')
        iconeGradeLista.setAttribute('aria-label', 'Mudar modo de apresentação de resultados para grade')
    }
}

function verificarRepetidos(array) {
    const contagem = {}
    array.forEach((elemento) => {
        if(contagem[elemento]){
            contagem[elemento] += 1
        } else {
            contagem[elemento] = 1
        }
    })

    const resultado = Object.keys(contagem).map((elemento) => {
        return { nome: elemento, repeticoes: contagem[elemento] };
    });
    
    resultado.sort((a, b) => b.repeticoes - a.repeticoes)

    return resultado
}
