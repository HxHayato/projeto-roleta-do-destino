/*
    Fluxo

    1º Carrega a página e cria as opções do select lendo as tabelas de "roletas.json" existentes

    2º Quando o usuário pede as raças, ele sorteia e depois mostra o resultado, agrupando as raças iguais e colocando o número de vezes que apareceram
*/

//Ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    criarOpcoesSelect()
})

//Lendo o JSON e criando as opções de roletas
async function criarOpcoesSelect () {
    try {
        const roletas = await fetch('roletas.json')
        const dados = await roletas.json()

        for await (const objeto of dados){
            criarEstruturaOption(objeto.regiao)
        }

    } catch (error) {
        console.log(`Erro ao ler o arquivo: ${error}`)
    }
}

//Abrir e fechar select
const dropdownSelect = document.querySelector('.dropdown-select') 
const opcaoEscolhida = document.querySelector('.selected-option')

dropdownSelect.addEventListener('click', (e) => {
    mostrarOpcoesMenu()
})

//Animações de início e abertura do menu, mostrando as opções
const opcoes = document.querySelectorAll('.opcoes')

function mostrarOpcoesMenu () {
    const seta = document.querySelector('.bxs-down-arrow')
    const menuOpcoes = document.querySelector('.option-container')

    //Se a seta estiver normal (para baixo) e o menu fechado
    if(!seta.classList.contains('virar')) {
        //Adiciona a classe .virar
        seta.classList.add('virar')
        
        //Abre o menu de opções
        menuOpcoes.classList.add('aberto')

        //Tira o arredondamento das bordas de cima do campo de menu
        dropdownSelect.style.borderRadius = '3px 3px 0 0'
    } else {
        //Tira a classe virar e adiciona a animação de desvirar
        seta.classList.remove('virar')
        seta.classList.add('desvirar')

        //Fecha o menu de opcoes adicionando a classe .fechado
        menuOpcoes.classList.remove('aberto')
        menuOpcoes.classList.add('fechado')
        dropdownSelect.style.borderRadius = '3px'

        //Após o fim da animação, ele retira a classe desvirar
        setTimeout(() => {
            seta.classList.remove('desvirar')
            menuOpcoes.classList.remove('fechado')
        }, 1000);
    }
}

function lidarComSelecaoOpcaoRoleta(opcao) {
    //Quando clicar em uma opção do select de roletas, mostra ela como opção escolhida
    const opcaoAtiva = document.querySelector('.ativo')

    if(opcao.dataset.value != opcaoEscolhida.dataset.value){
        opcaoAtiva.classList.remove('ativo')
        opcao.classList.add('ativo')
        opcaoEscolhida.dataset.value = opcao.dataset.value
        opcaoEscolhida.textContent = opcao.textContent
    }
}

//Criando a estrutura das opções do select, que serão chamadas ao carregar a página
function criarEstruturaOption (regiao) {
    const menuOpcoesSelect = document.querySelector('.option-container')
    const verificaOpcoes = menuOpcoesSelect.querySelector('.ativo')
    const opcao = document.createElement('span')

    opcao.setAttribute('data-value', regiao)
    opcao.classList.add('opcoes')
    opcao.textContent = regiao

    if(verificaOpcoes == null){
        opcao.classList.add('ativo')

        //Colocando essa opcao no campo principal
        opcaoEscolhida.textContent = opcao.textContent
        opcaoEscolhida.dataset.value = opcao.dataset.value
    }

    opcao.addEventListener('click', e => {
        lidarComSelecaoOpcaoRoleta(opcao)
    })

    menuOpcoesSelect.appendChild(opcao)
}

//Menu mobile
const botaoMenuMobile = document.querySelector('.icon-menu-mobile')
const icon = botaoMenuMobile.querySelector('.bx')
const navListMobile = document.querySelector('.navbar-mobile')
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
    const botaoAlterar = document.querySelector('.alterar-resultado')
    const verifLocalStorage = localStorage.getItem('modo-resultado')
    const icone = botaoAlterar.querySelector('.bx')
    const listaSorteado = document.querySelector('.lista-sorteados')
    const li = document.querySelector('.raca-vezes')

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

//Sorteando as raças
const botaoSortear = document.querySelector('.sortear')

botaoSortear.addEventListener('click', (e) => {
    const numVezes = document.getElementById('nVezes').value

    if(numVezes.length > 0 && numVezes > 0) {
        sortearRaca()
    } else {
        const modal = document.querySelector('.modal')

        modal.classList.toggle('ativo')
        setTimeout(() => {
            modal.classList.toggle('ativo')
        }, 2000);
    }
})

//Permite o sorteio ao apertar Enter
document.addEventListener('keypress', e => {
    if (e.key == 'Enter') {
        const numVezes = document.getElementById('nVezes').value

        if(numVezes.length > 0 && numVezes > 0) {
            sortearRaca()
        } else {
            const modal = document.querySelector('.modal')

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

        //Obtém os dados das roletas
        const response = await fetch('roletas.json')
        const dados = await response.json()

        //Obtém os dados das variações
        const response2 = await fetch('variacoes-racas.json')
        const dadosVariacoes = await response2.json()

        //Busca o índice da roleta que o usuário escolheu no select
        const index = dados.findIndex(roleta => roleta.regiao == opcaoEscolhida.dataset.value)

        if(index != null) {
            let i = 0
            let array = []

            //Populando o array com o nome das raças
            while(i < numVezes){
                //Envia o array da roleta e o array das variações
                array[i] = await acharRacaSorteada(dados[index].roletas, dadosVariacoes)
                i++
            }

            //Com o array preenchido, envia o resultado para a função que irá mostra-lo na tela
            mostrarResultado(array)
        } else {
            console.log('Roleta inválida')
        }
        
    } catch (error) {
        console.log(`Erro ao sortear raça: ${error}`)
    }
}

function acharRacaSorteada (array, dadosVariacoes) {
    let contador = 0

    try {
        while (contador < array.length ) {
            //calcula um número aleatório tendo o faixa máxima 0 e o tamanho da roleta do array, cada roleta pode ter números independentes e vai dar certo
            const roletas = array[contador].objetos
            const indiceAleatorio = Math.floor(Math.random()*roletas.length)
    
            if(roletas[indiceAleatorio].raca == `ROLETA ${contador+2}`) {
                contador++
            } else {
                //Vai verificar se a raça escolhida tem variações
                const racaEscolhida = roletas[indiceAleatorio].raca.toLowerCase()
                const indexDaVariacaoDaRaca = dadosVariacoes.findIndex(variacao => variacao.raca.toLowerCase() == racaEscolhida)
    
                //Se for diferente de -1, está com o índice da variação
                if(indexDaVariacaoDaRaca != -1){
                    contador = 0
    
                    //Vai buscar até que obtenha uma raça, se cair "ROLETA X", ele faz de novo
                    while (contador < dadosVariacoes[indexDaVariacaoDaRaca].roletas.length) {
                        // //Gera o numero aleatório
                        const roleta = dadosVariacoes[indexDaVariacaoDaRaca].roletas[contador]
                        const randomIndex = Math.floor(Math.random() * roleta.objetos.length)
    
                        if(roleta.objetos[randomIndex].nome == `ROLETA ${contador+2}`){
                            contador++
                        } else {
                            return roleta.objetos[randomIndex].nome
                        }
                    }
                }

                return roletas[indiceAleatorio].raca
            }
        }
    } catch (error) {
        console.log(`Erro ao buscar a raça. [ERROR]: ${error}`);
    }
}

//Constrói a estrutura que irá mostrar o resultado na tela e agrupa as raças iguais colocando o número de repetições
function mostrarResultado (array) {
    const resultado = document.querySelector('.resultado')

    //resetando o valor do resultado
    resultado.innerHTML = ''

    //Criando a parte de cima dos resultados
    const divTituloBotoes = document.createElement('div')
    divTituloBotoes.classList.add('div-titulo-botoes')
    resultado.appendChild(divTituloBotoes)

    const h2Titulo = document.createElement('h2')
    h2Titulo.classList.add('titulo-resultado')
    h2Titulo.textContent = 'O destino decidiu:'
    divTituloBotoes.appendChild(h2Titulo)
    
    const divBotoes = document.createElement('div')
    divBotoes.classList.add('botoes-resultado')
    divTituloBotoes.appendChild(divBotoes)

    const botaoGradeLista = document.createElement('button')
    botaoGradeLista.classList.add('alterar-resultado')
    divBotoes.appendChild(botaoGradeLista)
    botaoGradeLista.addEventListener('click', (e) => {
        alterarResultado()
    })

    const iconeGradeLista = document.createElement('i')
    iconeGradeLista.classList.add('bx')
    //O atributo de lista ou grade está mais abaixo
    botaoGradeLista.appendChild(iconeGradeLista)

    //Lista de raças
    const ulListaSorteado = document.createElement('ul')
    ulListaSorteado.classList.add('lista-sorteados')
    resultado.appendChild(ulListaSorteado)

    //Agrupa os de mesma raça
    const sorteados = verificarRepetidos(array)

    sorteados.forEach(raca => {
        const liRacaVezes = document.createElement('li')
        liRacaVezes.classList.add('raca-vezes')
        ulListaSorteado.appendChild(liRacaVezes)

        const pRaca = document.createElement('p')
        pRaca.classList.add('raca')
        pRaca.textContent = raca.nome
        liRacaVezes.appendChild(pRaca)

        const spanVezes = document.createElement('span')
        spanVezes.classList.add('vezes')
        liRacaVezes.appendChild(spanVezes)

        const spanNumeroVezes = document.createElement('span')
        spanNumeroVezes.classList.add('numero-vezes')
        spanVezes.appendChild(spanNumeroVezes)
        spanNumeroVezes.textContent = raca.repeticoes

        spanVezes.textContent += 'x'
    })

    //Verifica a preferência do usuário
    if(localStorage.getItem('modo-resultado')){
        const modo = localStorage.getItem('modo-resultado')

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

    //Ordena o resultado do maior ao menor
    resultado.sort((a, b) => b.repeticoes - a.repeticoes)

    return resultado
}