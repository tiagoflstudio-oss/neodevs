const readline = require('readline');
const https = require('https');

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envVars = {};

if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const API_KEY = envVars.OPENAI_API_KEY;

if (!API_KEY) {
  console.error('❌ Configure OPENAI_API_KEY no .env primeiro');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askGPT(prompt) {
  const data = JSON.stringify({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2000,
    temperature: 0.7
  });

  const options = {
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json.choices[0]?.message?.content || 'Sem resposta');
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

console.log('🤖 GPT Terminal - Digite seu prompt (Ctrl+C para sair)\n');

function promptUser() {
  rl.question('> ', async (input) => {
    if (!input.trim()) {
      promptUser();
      return;
    }
    
    console.log('⏳ Pensando...\n');
    try {
      const response = await askGPT(input);
      console.log(response);
      console.log('');
    } catch (e) {
      console.error('❌ Erro:', e.message);
    }
    promptUser();
  });
}

promptUser();