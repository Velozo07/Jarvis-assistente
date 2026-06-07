// Chave da API integrada
const API_KEY = "AQ.Ab8RN6JLq-dAIZMvIfqmlmVnUawJfIC3DY0HrFYjXt2NiehgxQ"; 
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY;

const statusTxt = document.getElementById('status');
const transcricaoTxt = document.getElementById('transcricao');
const respostaTxt = document.getElementById('resposta');
const jarvisCore = document.getElementById('jarvis-core');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'pt-BR';
recognition.continuous = true;
recognition.interimResults = false;

const synth = window.SpeechSynthesis;

function falar(texto) {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1;
    synth.speak(utterance);
}

// Inicia o sistema de escuta contínua
recognition.start();
statusTxt.innerText = "Aguardando comando: 'E aí Jarvis'...";

recognition.onresult = async (event) => {
    const resultIndex = event.resultIndex;
    const comando = event.results[resultIndex][0].transcript.toLowerCase().trim();

    transcricaoTxt.innerText = `Você disse: "${comando}"`;

    if (comando.includes("parar") || comando.includes("silêncio")) {
        synth.cancel();
        respostaTxt.innerText = "[Interrompido]";
        return;
    }

    if (comando.includes("e aí jarvis") || comando.includes("ei jarvis") || comando.includes("jarvis")) {
        const perguntaReal = comando.replace(/e aí jarvis|ei jarvis|jarvis/g, '').trim();

        if (!perguntaReal) {
            jarvisCore.classList.add('listening');
            statusTxt.innerText = "Sim? Estou ouvindo...";
            falar("Sim? Como posso ajudar?");
            return;
        }

        processarComandoGemini(perguntaReal);
    }
};

recognition.onend = () => {
    recognition.start();
};

async function processarComandoGemini(pergunta) {
    jarvisCore.classList.add('listening');
    statusTxt.innerText = "Pensando...";
    respostaTxt.innerText = "Buscando resposta...";

    const agora = new Date();
    const contextoTempo = `Contexto: Hoje é dia ${agora.toLocaleDateString('pt-BR')} e agora são ${agora.toLocaleTimeString('pt-BR')}. Você é o Jarvis, um assistente virtual ultra rápido e natural.`;

    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${contextoTempo} ${pergunta}`
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
        jarvisCore.classList.remove('listening');
        setTimeout(() => {
            statusTxt.innerText = "Aguardando comando: 'E aí Jarvis'...";
        }, 1000);
    }
                                    }
                   
