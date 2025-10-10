const https = require('https');

const options = {
  hostname: 'zbsjjafbrwloedtkwfjl.supabase.co',
  port: 443,
  path: '/rest/v1/aura_jobs_candidatos?status=in.(case_enviado,em_avaliacao_case)&select=id,nome_completo,email,status,url_entregavel_1,url_entregavel_2,url_video',
  method: 'GET',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpic2pqYWZicndsb2VkdGt3ZmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4ODA2MzUsImV4cCI6MjA1MjQ1NjYzNX0.3Y_EDoLdcIGLdtFPp9FzovxmEHZO3uR1brrQCaOGvJw',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpic2pqYWZicndsb2VkdGt3ZmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4ODA2MzUsImV4cCI6MjA1MjQ1NjYzNX0.3Y_EDoLdcIGLdtFPp9FzovxmEHZO3uR1brrQCaOGvJw'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const candidatos = JSON.parse(data);
      console.log('\n=== CANDIDATOS COM STATUS DE CASE ===');
      console.log('Total encontrado:', candidatos.length);
      console.log('\n');
      candidatos.forEach(c => {
        console.log('-----------------------------------');
        console.log('ID:', c.id);
        console.log('Nome:', c.nome_completo);
        console.log('Email:', c.email);
        console.log('Status:', c.status);
        console.log('Entregável 1:', c.url_entregavel_1 || 'NÃO ENTREGUE');
        console.log('Entregável 2:', c.url_entregavel_2 || 'NÃO ENTREGUE');
        console.log('Vídeo:', c.url_video || 'NÃO ENTREGUE');
      });
    } catch(e) {
      console.error('Erro ao parsear:', e);
      console.log('Data recebida:', data);
    }
  });
});

req.on('error', (e) => console.error('Erro na requisição:', e));
req.end();
