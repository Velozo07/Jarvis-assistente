// Coloque sua chave do AI Studio aqui
const API_KEY = "AQ.Ab8RN6JLq-dAIZMvIfqmlmVnUawJfIC3DY0HrFYjXt2NiehgxQ"; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const statusTxt = document.getElementById('status');
const transcricaoTxt = document.getElementById('transcricao');
const respostaTxt = document.getElementById('resposta');
const jarvisCore = document.getElementById('jarvis-core');

// Configura o reconhecimento de voz do navegador
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'pt-BR';
recognition.continuous = true;
recognition.interimResults = false;

// Inicializa o sintetizador de voz do navegador (Mais rápido que gTTS)
const synth = window.speechSynthesis;

function falar(texto) {
    // Cancela qualquer fala anterior imediata se você mandar parar ou interromper
    synth.cancel(); 
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1; // Deixa o Jarvis falando um pouquinho mais rápido e natural
    synth.speak(utterance);
}

// Inicia o sistema de escuta contínua
recognition.start();
statusTxt.innerText = "Aguardando comando: 'E aí Jarvis'...";

recognition.onresult = async (event) => {
    const resultIndex = event.resultIndex;
    const comando = event.results[resultIndex][0].transcript.toLowerCase().trim();
    
    transcricaoTxt.innerText = `Você disse: "${comando}"`;

    // Comando de interrupção imediata
    if (comando.includes("parar") || comando.includes("silêncio")) {
        synth.cancel();
        respostaTxt.innerText = "[Interrompido]";
        return;
    }

    // Verifica a palavra de ativação
    if (comando.includes("e aí jarvis") || comando.includes("ei jarvis") || comando.includes("jarvis")) {
        // Limpa a palavra de ativação para mandar apenas a pergunta real ao Gemini
        const perguntaReal = comando.replace(/e aí jarvis|ei jarvis|jarvis/g, '').trim();
        
        if (!perguntaReal) {
            jarvisCore.classList.add('listening');
            statusTxt.innerText = "Sim? Estou ouvindo...";
            falar("Sim? Como posso ajudar?");
            return;
        }

        // Se já tiver uma pergunta junto com o nome, processa direto
        processarComandoGemini(perguntaReal);
    }
};

async function processarComandoGemini(pergunta) {
    jarvisCore.classList.add('listening');
    statusTxt.innerText = "Pensando...";
    respostaTxt.innerText = "Buscando resposta...";

    // Injeta o contexto de tempo real básico do dispositivo do usuário
    const agora = new Date();
    const contextoTempo = `Contexto: Hoje é dia ${agora.toLocaleDateString('pt-BR')} e agora são ${agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}.`;

    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${contextoTempo} Você é o Jarvis, um assistente virtual ultra rápido e preciso. Responda de forma curta, direta e conversacional em no máximo duas frases: ${pergunta}`
                    }]
                }]
            })
        });

        const data = await response.json();
        const textoResposta = data.candidates[0].content.parts[0].text.replace(/\*/g, '');

        statusTxt.innerText = "Respondendo...";
        respostaTxt.innerText = textoResposta;
        falar(textoResposta);

    } catch (error) {
        console.error(error);
        respostaTxt.innerText = "Erro ao conectar com o cérebro do Jarvis.";
        falar("Desculpe, tive um problema de conexão.");
    } finally {
        // Volta o Jarvis para o modo de espera visual azul
        setTimeout(() => {
            jarvisCore.classList.remove('listening');
            statusTxt.innerText = "Aguardando comando: 'E aí Jarvis'...";
        }, 1000);
    }
}

// Garante que se o reconhecimento fechar sozinho por inatividade, ele reativa na hora
recognition.onend = () => {
    recognition.start();
};
          
