export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt vazio' });
    }

    // 1. Mudamos para a sua nova variável da Groq
    const apiKey = process.env.GROQ_API_KEY; 

    try {
        // 2. Novo endpoint para o GroqCloud
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            // 3. Estrutura de corpo compatível com a Groq (padrão OpenAI)
            body: JSON.stringify({
                model: 'llama3-8b-8192', // Modelo rápido e excelente para o Jarvis
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        // Ajuste na leitura da resposta da Groq
        const text = data.choices[0].message.content;
        return res.status(200).json({ text });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
