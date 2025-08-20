/**
 * Agenda Veterinaria - Funcionalidades para reservar citas y mostrar historial
 */

// Datos de ejemplo para el historial (en una aplicación real, estos datos vendrían de una base de datos)
const historialVisitas = [
    {
        id: 1,
        fecha: '15/05/2023',
        mascota: 'Max',
        veterinario: 'Dr. García',
        diagnostico: 'Infección cutánea',
        tratamiento: 'Antibióticos y baños medicados',
        detalles: 'Infección causada por alergia a detergente. Aplicar antibiótico tópico dos veces al día y baño medicado semanal durante 3 semanas.'
    },
    {
        id: 2,
        fecha: '22/06/2023',
        mascota: 'Luna',
        veterinario: 'Dra. Rodríguez',
        diagnostico: 'Vacunación anual',
        tratamiento: 'Vacunas múltiples',
        detalles: 'Vacuna pentavalente y antirrábica. Próxima vacunación en junio 2024.'
    },
    {
        id: 3,
        fecha: '10/07/2023',
        mascota: 'Rocky',
        veterinario: 'Dr. López',
        diagnostico: 'Fractura en pata delantera',
        tratamiento: 'Cirugía y rehabilitación',
        detalles: 'Fractura de radio y cúbito. Cirugía con colocación de placa y tornillos. Rehabilitación durante 2 meses. Evitar ejercicio intenso.'
    },
    {
        id: 4,
        fecha: '05/08/2023',
        mascota: 'Max',
        veterinario: 'Dra. Martínez',
        diagnostico: 'Control cardíaco',
        tratamiento: 'Medicación continua',
        detalles: 'Soplo cardíaco grado 2. Medicación diaria con enalapril 5mg cada 12 horas. Control en 3 meses.'
    }
];

// Elementos del DOM
const formularioReserva = document.getElementById('formulario-reserva');
const filtroMascota = document.getElementById('filtro-mascota');
const tablaHistorial = document.getElementById('datos-historial');

// Evento para cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la tabla de historial
    cargarHistorial('todas');
    
    // Configurar el evento de filtrado
    if (filtroMascota) {
        filtroMascota.addEventListener('change', (e) => {
            cargarHistorial(e.target.value);
        });
    }
    
    // Configurar el evento de envío del formulario
    if (formularioReserva) {
        formularioReserva.addEventListener('submit', manejarReservaCita);
    }
    
    // Configurar eventos para los botones de detalles
    configurarBotonesDetalles();
});

/**
 * Carga el historial de visitas en la tabla
 * @param {string} filtro - El valor del filtro de mascota
 */
function cargarHistorial(filtro) {
    if (!tablaHistorial) return;
    
    // Limpiar la tabla
    tablaHistorial.innerHTML = '';
    
    // Filtrar las visitas según la mascota seleccionada
    const visitasFiltradas = filtro === 'todas' 
        ? historialVisitas 
        : historialVisitas.filter(visita => visita.mascota.toLowerCase() === filtro.toLowerCase());
    
    // Agregar las filas a la tabla
    visitasFiltradas.forEach(visita => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${visita.fecha}</td>
            <td>${visita.mascota}</td>
            <td>${visita.veterinario}</td>
            <td>${visita.diagnostico}</td>
            <td>${visita.tratamiento}</td>
            <td><button class="boton-detalles" data-id="${visita.id}"><i class="fas fa-eye"></i> Ver detalles</button></td>
        `;
        tablaHistorial.appendChild(fila);
    });
    
    // Configurar los eventos para los nuevos botones
    configurarBotonesDetalles();
}

/**
 * Configura los eventos para los botones de detalles
 */
function configurarBotonesDetalles() {
    const botonesDetalles = document.querySelectorAll('.boton-detalles');
    botonesDetalles.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = parseInt(boton.getAttribute('data-id'));
            const visita = historialVisitas.find(v => v.id === id);
            if (visita) {
                mostrarDetallesVisita(visita);
            }
        });
    });
}

/**
 * Muestra los detalles de una visita en un modal
 * @param {Object} visita - La visita a mostrar
 */
function mostrarDetallesVisita(visita) {
    // Crear el modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Contenido del modal
    modal.innerHTML = `
        <div class="modal-contenido">
            <span class="cerrar-modal">&times;</span>
            <h3>Detalles de la Visita</h3>
            <div class="detalles-visita">
                <p><strong>Fecha:</strong> ${visita.fecha}</p>
                <p><strong>Mascota:</strong> ${visita.mascota}</p>
                <p><strong>Veterinario:</strong> ${visita.veterinario}</p>
                <p><strong>Diagnóstico:</strong> ${visita.diagnostico}</p>
                <p><strong>Tratamiento:</strong> ${visita.tratamiento}</p>
                <p><strong>Detalles adicionales:</strong> ${visita.detalles}</p>
            </div>
        </div>
    `;
    
    // Agregar el modal al body
    document.body.appendChild(modal);
    
    // Mostrar el modal
    setTimeout(() => {
        modal.style.display = 'flex';
    }, 10);
    
    // Configurar el evento para cerrar el modal
    const cerrarModal = modal.querySelector('.cerrar-modal');
    cerrarModal.addEventListener('click', () => {
        modal.style.display = 'none';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    // Cerrar el modal al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    });
}

/**
 * Maneja el envío del formulario de reserva de cita
 * @param {Event} e - El evento de envío del formulario
 */
function manejarReservaCita(e) {
    e.preventDefault();
    
    // Obtener los valores del formulario
    const mascota = document.getElementById('mascota').value;
    const tipoMascota = document.getElementById('tipo-mascota').value;
    const veterinario = document.getElementById('veterinario').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const motivo = document.getElementById('motivo').value;
    
    // En una aplicación real, aquí se enviarían los datos al servidor
    // Para este ejemplo, mostraremos una confirmación
    mostrarConfirmacionReserva({
        mascota,
        tipoMascota,
        veterinario: document.getElementById('veterinario').options[document.getElementById('veterinario').selectedIndex].text,
        fecha: formatearFecha(fecha),
        hora,
        motivo
    });
    
    // Limpiar el formulario
    formularioReserva.reset();
}

/**
 * Muestra una confirmación de la reserva de cita
 * @param {Object} datos - Los datos de la reserva
 */
function mostrarConfirmacionReserva(datos) {
    // Crear el modal de confirmación
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Contenido del modal
    modal.innerHTML = `
        <div class="modal-contenido">
            <span class="cerrar-modal">&times;</span>
            <h3>¡Cita Reservada con Éxito!</h3>
            <div class="detalles-visita">
                <p><strong>Mascota:</strong> ${datos.mascota} (${datos.tipoMascota})</p>
                <p><strong>Veterinario:</strong> ${datos.veterinario}</p>
                <p><strong>Fecha:</strong> ${datos.fecha}</p>
                <p><strong>Hora:</strong> ${datos.hora}</p>
                <p><strong>Motivo:</strong> ${datos.motivo}</p>
                <p class="mensaje-confirmacion">Recibirás un correo electrónico con la confirmación de tu cita.</p>
            </div>
        </div>
    `;
    
    // Agregar el modal al body
    document.body.appendChild(modal);
    
    // Mostrar el modal
    setTimeout(() => {
        modal.style.display = 'flex';
    }, 10);
    
    // Configurar el evento para cerrar el modal
    const cerrarModal = modal.querySelector('.cerrar-modal');
    cerrarModal.addEventListener('click', () => {
        modal.style.display = 'none';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    // Cerrar el modal al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    });
}

/**
 * Formatea una fecha en formato YYYY-MM-DD a DD/MM/YYYY
 * @param {string} fecha - La fecha en formato YYYY-MM-DD
 * @returns {string} La fecha formateada
 */
function formatearFecha(fecha) {
    const partes = fecha.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}