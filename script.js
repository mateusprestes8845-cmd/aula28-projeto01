let txtbuscar = document.getElementById('txtbuscar')
let btnBuscar = document.getElementById('btnBuscar')
let cdd = document.getElementById('cdd')
let data = document.getElementById('data')
let temp = document.getElementById('temp')
let sensacao = document.getElementById('sensacao')
let umidade = document.getElementById('umidade')
let vento = document.getElementById('vento')
let precipitacao = document.getElementById('precipitacao')
let dias = document.getElementById('dias')
let horas = document.getElementById('horas')
let selDia = document.getElementById('selDia')

let cddPadrao = 'Porto Alegre, RS, Brasil'

let dadosTempo = {}

let icones = {
    0: 'sunny',
    1: 'partly-cloudy', 2:'partly-cloudy',
    3: 'overcast',
    45: 'fog', 48: 'fog',
    51: 'drizzle', 53: 'drizzle', 55: 'drizzle', 56: 'drizzle', 57: 'drizzle',
    61:'rain', 63:'rain', 65: 'rain', 66: 'rain', 67:'rain',
    80: 'rain', 81: 'rain', 82: 'rain',
    71: 'snow', 73: 'snow', 75: 'snow', 85: 'snow', 86: 'snow',
    95: 'storm', 96: 'storm', 99: 'storm'
}

let descricoes = {
    'sunny': 'Ensolarado',
    'partly-cloudy': 'Parcialmente Nublado',
    'overcast': 'Nublado',
    'fog': 'Neblina',
    'drizzle': 'Garoa',
    'rain': 'Chuva',
    'snow': 'Neve',
    'storm': 'Tempestade'
}

async function buscarcdd() {

    let buscar = txtbuscar.value.trim() || cddPadrao
    
    try {
        let resposta = await fetch(`https://nominatim.openstreetmap.org/search?q=${buscar}&format=jsonv2&addressdetails=1&accept-language=pt-BR`)

        if (!resposta.ok) {
            throw new Error('Status: ' + resposta.status);

        }

        let locais = await resposta.json()

        mostrarLocal(locais[0])
        buscarTempo(locais[0].lat, locais[0].lon)
    } catch (erro) {
        console.log('Erro ao buscar a cidade: ', erro.message)

    }  
}

function mostrarLocal(local) {
    let end = local.address

    let nomecdd = end.city || end.town || end.village || end.municipality || local.name
    let pais = end. country_code.toUpperCase()

    let hoje = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(new Date())

    cdd.innerText = `${nomecdd}, ${pais}`
    data.innerText = hoje
}

async function buscarTempo(lat, lon) {
    let url = 'https://api.open-meteo.com/v1/forecast'

    + `?latitude=${lat}&longitude=${lon}`
    + '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m'
    + '&hourly=temperature_2m,weather_code'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min'
    + '&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm'

    try {
        let resposta = await fretch(url)

        if (!resposta.ok) {
            throw new Error('Status: ' + resposta.status)
        }

        dadosTempo = await resposta.json()

        mostrarTempoAtual()
        mostrarPrevisaoDiaria()
        mostrarPrevisaoPorHora()
    } catch (erro) {
        console.log('Erro ao buscar o Tempo: ', erro.message)
    }
}

function mostrarTempoAtual () {
    let atual = dadosTempo.current
    let unidades = dadosTempo.current_units

    temp.innerText = Math.round(atual.temperature_2m)
    sensacao.innerText = Math.round(atual.apparent_temperature)
    umidadde. innerText = atual.relative_humidity_2m
    vento.innerText = `${atual.wind_speed_10m} ${unidades.wind_speed_10m}`
    precipitacao.innerText = `${atual.precipitation} ${unidades.precipitation}`
}

function criarIcone (codigo,classe) {
    let nomeIcone = icones[codigo]

    let img = document.createElement('img')
    img.classList(classe)
    img.src = `imagems/icon-${nomeIcone}.webp`
    img.alt = descricoes[nomeIcone]
    img.width = 320
    img.heigth = 320
    return img
}

function mostrarPrevisaoDiaria () {
    let diaria = dadosTempo.daily

    dias.innerHTML= ''

    for (let i = 0; i < 7; i++) {
        let nomeDia = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(new Date(diaria.time[i]))

        let dia = document.createElement('div')
        dia.classList.add('bl', 'dia')

        let nome = document.createElement('p')
        nome.classList.add('dia-nome')
        nome.innerText = nomeDia

        let icone = criarIcone(diaria.weather_code[i], 'dia-icone')

        let temps = document.createElement('div')
        temps.classList('dia-temps')

        let maxima = document.createElement('p')
        maxima.innerText = Math.round(diaria.temperature_2m_max[i]) + '°'

        let minima = document.createElement('p')
        minima.classList.add('dia-min')
        minima.innerText = Math.round(diaria.temperature_2m_min[i]) + '°'

        temps.appendChild(maxima)
        temps.appendChild(minima)

        dia.appendChild(nome)
        dia.appendChild(icone)
        dia.appendChild(temps)
        dias.appendChild(dia)
    }
}

function mostrarPrevisaoPorHora() {
    let porHora = dadosTempo.hourly

    let primeiraHora = 24 * Number(selDia.value)

    horas.innerHTML = ''

    for ( let h = primeiraHora; 1 < primeiraHora + 24; h++) {
        let hora = document.createElement('div')
        hora.classList.add('hora')

        let icone = criarIcone(porHora.weather_code[h], 'hora-icone')

        let texto = document.createElement('p')
        texto.classList.add('hora-texto')
        texto.innerText = new Date(porHora.time[h]).toLocaleString('pt-BR', {hour: '2-digit', minute:'2-digit' })

       let temp = document.createElement('p')
       temp.classList.add('hora-temp')
       temp.innerText = Math.round(porHora.temperature_2m[h]) + '°'

       hora.appendChild(texto)
       hora.appendChild(temp)
       hora.appendChild(hora)
    }
}

function preencherDias() {
    let dataDia = new Date()

    for (let i = 0; i < 7; i++) {
        let opcao = document.createElement('option')
        opcao.value = i
        opcao.innerText = new Intl.DateTimeFormat('pt-BR', {weekday: 'long'}).format(dataDia)
        selDia.appendChild(opcao)

        dataDia.setDate(dataDia.getDate() + 1)
    }
}

btnBuscar.addEventListener('click', buscarcdd)
selDia.addEventListener('change', mostrarPrevisaoPorHora)

preencherDias()
buscarcdd()


