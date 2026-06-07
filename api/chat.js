const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: `${contextoTempo} ${pergunta}`
  })
});

const data = await response.json();

if (data.error) {
  throw new Error(data.error);
}

const textoResposta = data.text;
