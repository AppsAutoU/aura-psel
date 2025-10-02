// Simple script to trigger AI evaluation for Paula Mannarino
const candidatoId = process.argv[2];

if (!candidatoId) {
  console.log('Please provide candidate ID');
  process.exit(1);
}

fetch('http://localhost:3000/api/ai/avaliar-candidato', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ candidato_id: candidatoId })
})
.then(res => res.json())
.then(data => {
  console.log('✅ AI Evaluation Result:');
  console.log(JSON.stringify(data, null, 2));
})
.catch(err => {
  console.error('❌ Error:', err.message);
});
