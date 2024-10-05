// Al cargar la página, actualiza el contador de tickets
document.addEventListener('DOMContentLoaded', function() {
    updateTicketCount();
    
    // Agregar eventos a los botones
    document.getElementById('ticket-form').addEventListener('submit', handleTicketFormSubmit);
    document.getElementById('delete-btn').addEventListener('click', handleDeleteTickets);
    document.getElementById('print-btn').addEventListener('click', handlePrintTickets);
    document.getElementById('search-ticket').addEventListener('input', handleSearchTicket);
    document.getElementById('count-btn').addEventListener('click', loadExistingTickets);
    document.getElementById('used-tickets-btn').addEventListener('click', loadUsedTickets);
});

// Función para cargar y mostrar los tickets guardados
function loadExistingTickets() {
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const ticketList = document.getElementById('ticket-list');
    ticketList.innerHTML = ''; // Limpiar la lista antes de cargar

    tickets.forEach((ticket, index) => {
        createTicketElement(ticket.id, ticket.status, index + 1);
    });

    if (tickets.length === 0) {
        ticketList.innerHTML = '<p>No hay tickets generados.</p>';
    }
}

// Manejar el envío del formulario de tickets
function handleTicketFormSubmit(event) {
    event.preventDefault();
    
    // Mostrar el preloader
    document.getElementById('preloader').style.display = 'block';

    const count = document.getElementById('ticket-count').value;
    for (let i = 0; i < count; i++) {
        generateTicket();
    }

    // Limpiar el campo de entrada después de generar los tickets
    document.getElementById('ticket-count').value = '';
    loadExistingTickets(); // Cargar tickets existentes después de generar

    // Ocultar el preloader después de que se hayan generado los tickets
    document.getElementById('preloader').style.display = 'none';
}

// Generar tickets
function generateTicket() {
    const ticketId = 'TICKET-' + Math.floor(Math.random() * 1000000);
    saveTicket(ticketId, 'Sin Uso'); // Guardar ticket antes de mostrarlo
}

// Crear el elemento del ticket en el DOM
function createTicketElement(ticketId, status, ticketNumber) {
    const ticketList = document.getElementById('ticket-list');
    
    const qr = new QRious({
        value: ticketId,
        size: 100
    });
    
    const ticketElement = document.createElement('div');
    ticketElement.classList.add('qr-ticket', 'text-center');
    ticketElement.innerHTML = `
        <p><strong>Ticket ${ticketNumber}</strong></p>
        <p><strong>ID del Ticket:</strong> ${ticketId}</p>
        <img src="${qr.toDataURL()}" alt="QR Ticket">
        <p><strong>Estado:</strong> <span class="ticket-status">${status}</span></p>
        <button class="btn btn-warning btn-sm mt-2" onclick="changeTicketStatus('${ticketId}', this)">Cambiar Estado</button>
        <button class="btn btn-secondary btn-sm mt-2" onclick="copyToClipboard('${ticketId}')">Copiar</button>
    `;
    
    ticketList.appendChild(ticketElement);
}

// Función para copiar el código de ticket al portapapeles
function copyToClipboard(ticketId) {
    navigator.clipboard.writeText(ticketId).then(() => {
        alert(`Código del ticket "${ticketId}" copiado al portapapeles.`);
    });
}

// Guardar ticket en localStorage
function saveTicket(id, status) {
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    tickets.push({ id, status });
    localStorage.setItem('tickets', JSON.stringify(tickets));
    updateTicketCount();
}

// Cambiar estado del ticket
function changeTicketStatus(ticketId, button) {
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (ticket) {
        ticket.status = ticket.status === 'Sin Uso' ? 'Usado' : 'Sin Uso';
        localStorage.setItem('tickets', JSON.stringify(tickets));
        button.previousElementSibling.querySelector('.ticket-status').textContent = ticket.status;
    }
}

// Consultar cantidad de tickets generados
function updateTicketCount() {
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    document.getElementById('ticket-count-info').textContent = `Total de Tickets: ${tickets.length}`;
}

// Eliminar todos los tickets
function handleDeleteTickets() {
    if (confirm('¿Estás seguro de que deseas eliminar todos los tickets?')) {
        localStorage.removeItem('tickets');
        document.getElementById('ticket-list').innerHTML = '';
        updateTicketCount();
    }
}

// Imprimir solo los tickets
function handlePrintTickets() {
    const ticketList = document.getElementById('ticket-list').cloneNode(true);
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Imprimir Tickets</title></head><body>');
    printWindow.document.write(ticketList.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// Buscar ticket por ID y permitir cambiar su estado
function handleSearchTicket() {
    const searchId = this.value.trim().toUpperCase();
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const resultDiv = document.getElementById('search-result');
    resultDiv.innerHTML = ''; // Limpiar resultados anteriores
    
    const ticket = tickets.find(t => t.id === searchId);

    if (ticket) {
        const qr = new QRious({
            value: ticket.id,
            size: 75 // Tamaño más pequeño del QR al buscar
        });

        resultDiv.innerHTML = `
            <div class="qr-ticket text-center">
                <p><strong>ID del Ticket:</strong> ${ticket.id}</p>
                <img src="${qr.toDataURL()}" alt="QR Ticket" class="search-qr">
                <p><strong>Estado:</strong> <span class="ticket-status">${ticket.status}</span></p>
                <button class="btn btn-warning btn-sm mt-2" onclick="changeTicketStatus('${ticket.id}', this)">Cambiar Estado</button>
                <button class="btn btn-secondary btn-sm mt-2" onclick="copyToClipboard('${ticket.id}')">Copiar</button>
            </div>
        `;
    }
}

// Consultar todos los tickets usados
function loadUsedTickets() {
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const usedTickets = tickets.filter(ticket => ticket.status === 'Usado');
    const ticketList = document.getElementById('ticket-list');
    ticketList.innerHTML = ''; // Limpiar la lista antes de cargar

    usedTickets.forEach((ticket, index) => {
        createTicketElement(ticket.id, ticket.status, index + 1);
    });

    if (usedTickets.length === 0) {
        ticketList.innerHTML = '<p>No hay tickets usados.</p>';
    }
}
