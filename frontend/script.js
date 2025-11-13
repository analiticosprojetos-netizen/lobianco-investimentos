document.addEventListener('DOMContentLoaded', () => {
    const apiStatusSpan = document.getElementById('api-status');

    // A API agora roda na porta 3001
    fetch('http://localhost:3001/api/status')
        .then(response => {
            if (!response.ok) {
                throw new Error('Resposta da API não foi OK');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'ok') {
                apiStatusSpan.textContent = 'Online';
                apiStatusSpan.style.color = 'green';
            } else {
                apiStatusSpan.textContent = 'Status Inesperado';
                apiStatusSpan.style.color = 'orange';
            }
        })
        .catch(error => {
            console.error('Erro ao conectar com a API:', error);
            apiStatusSpan.textContent = 'Offline';
            apiStatusSpan.style.color = 'red';
        });
});
