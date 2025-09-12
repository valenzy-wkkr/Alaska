/**
 * Gestión del historial de visitas y tratamientos
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const listaCitas = document.getElementById('lista-citas');
    const filtroMascota = document.getElementById('filtro-mascota');
    const btnExportar = document.getElementById('btn-exportar');
    const plantillaVisita = document.getElementById('plantilla-visita');
    
    // Datos de ejemplo (en una aplicación real, estos vendrían de una API)
    const historialVisitas = [
        {
            id: 1,
            fecha: '15/05/2023',
            mascota: 'Max',
            tipoMascota: 'Perro',
            veterinario: 'Dr. García',
            diagnostico: 'Infección cutánea',
            tratamiento: 'Antibióticos y baños medicados',
            detalles: 'Infección causada por alergia a detergente. Aplicar antibiótico tópico dos veces al día y baño medicado semanal durante 3 semanas.',
            estado: 'completada',
            proximaCita: '15/06/2023'
        },
        {
            id: 2,
            fecha: '22/06/2023',
            mascota: 'Luna',
            tipoMascota: 'Gato',
            veterinario: 'Dra. Rodríguez',
            diagnostico: 'Vacunación anual',
            tratamiento: 'Vacunas múltiples',
            detalles: 'Vacuna pentavalente y antirrábica. Próxima vacunación en junio 2024.',
            estado: 'completada',
            proximaCita: '22/06/2024'
        },
        {
            id: 3,
            fecha: '10/07/2023',
            mascota: 'Rocky',
            tipoMascota: 'Perro',
            veterinario: 'Dr. López',
            diagnostico: 'Fractura en pata delantera',
            tratamiento: 'Cirugía y rehabilitación',
            detalles: 'Fractura de radio y cúbito. Cirugía con colocación de placa y tornillos. Rehabilitación durante 2 meses. Evitar ejercicio intenso.',
            estado: 'completada',
            proximaCita: '10/09/2023'
        },
        {
            id: 4,
            fecha: '05/08/2023',
            mascota: 'Max',
            tipoMascota: 'Perro',
            veterinario: 'Dra. Martínez',
            diagnostico: 'Control cardíaco',
            tratamiento: 'Medicación continua',
            detalles: 'Soplo cardíaco grado 2. Medicación diaria con enalapril 5mg cada 12 horas. Control en 3 meses.',
            estado: 'pendiente',
            proximaCita: '05/11/2023'
        }
    ];

    // Cargar el historial al iniciar la página
    cargarHistorial();

    // Evento para filtrar por mascota
    if (filtroMascota) {
        filtroMascota.addEventListener('change', function() {
            cargarHistorial(this.value);
        });
    }

    // Evento para exportar el historial
    if (btnExportar) {
        btnExportar.addEventListener('click', exportarHistorial);
    }

    /**
     * Carga el historial de visitas en la interfaz
     * @param {string} filtro - Filtro opcional para mostrar solo una mascota
     */
    function cargarHistorial(filtro = 'todas') {
        // Limpiar la lista de citas
        listaCitas.innerHTML = '';

        // Filtrar las visitas si se especificó un filtro
        const visitasFiltradas = filtro === 'todas' 
            ? historialVisitas 
            : historialVisitas.filter(visita => 
                visita.mascota.toLowerCase() === filtro.toLowerCase() ||
                visita.tipoMascota.toLowerCase() === filtro.toLowerCase()
            );

        // Mostrar mensaje si no hay citas
        if (visitasFiltradas.length === 0) {
            listaCitas.innerHTML = `
                <div class="sin-citas">
                    <i class="fas fa-calendar-times fa-3x"></i>
                    <p>No hay citas registradas para esta mascota</p>
                </div>
            `;
            return;
        }

        // Ordenar por fecha (más reciente primero)
        const visitasOrdenadas = [...visitasFiltradas].sort((a, b) => {
            return new Date(b.fecha.split('/').reverse().join('-')) - new Date(a.fecha.split('/').reverse().join('-'));
        });

        // Mostrar cada visita en la lista
        visitasOrdenadas.forEach(visita => {
            const tarjeta = crearTarjetaVisita(visita);
            listaCitas.appendChild(tarjeta);
        });

        // Configurar los botones de detalles
        configurarBotonesDetalles();
    }

    /**
     * Crea un elemento de tarjeta de visita a partir de los datos de la visita
     * @param {Object} visita - Datos de la visita
     * @returns {HTMLElement} Elemento de tarjeta de visita
     */
    function crearTarjetaVisita(visita) {
        // Clonar la plantilla
        const tarjeta = plantillaVisita.content.cloneNode(true).querySelector('.tarjeta-visita');
        
        // Rellenar los datos
        tarjeta.querySelector('.fecha').textContent = visita.fecha;
        tarjeta.querySelector('.nombre-mascota').textContent = `${visita.mascota} (${visita.tipoMascota})`;
        tarjeta.querySelector('.diagnostico').textContent = visita.diagnostico;
        tarjeta.querySelector('.tratamiento').textContent = visita.tratamiento;
        tarjeta.querySelector('.veterinario').textContent = visita.veterinario;
        tarjeta.querySelector('.notas').textContent = visita.detalles;
        
        // Configurar el estado
        const estadoElement = tarjeta.querySelector('.estado');
        estadoElement.textContent = visita.estado;
        estadoElement.className = `estado ${visita.estado}`;
        
        // Configurar los botones de acción
        const btnDetalles = tarjeta.querySelector('.boton-detalles');
        const detallesAdicionales = tarjeta.querySelector('.detalles-adicionales');
        
        // Configurar eventos para los botones de PDF e Imprimir
        tarjeta.querySelector('.boton-texto[data-accion="pdf"]').addEventListener('click', () => {
            generarPDF(visita);
        });
        
        tarjeta.querySelector('.boton-texto[data-accion="imprimir"]').addEventListener('click', () => {
            window.print();
        });
        
        return tarjeta;
    }

    /**
     * Configura los botones de detalles para mostrar/ocultar información adicional
     */
    function configurarBotonesDetalles() {
        document.querySelectorAll('.boton-detalles').forEach(boton => {
            boton.addEventListener('click', function() {
                const detalles = this.nextElementSibling;
                const estaExpandido = this.getAttribute('aria-expanded') === 'true';
                
                // Alternar el estado
                this.setAttribute('aria-expanded', !estaExpandido);
                detalles.setAttribute('aria-hidden', estaExpandido);
                
                // Cambiar el ícono
                const icono = this.querySelector('i');
                if (estaExpandido) {
                    icono.classList.remove('fa-chevron-up');
                    icono.classList.add('fa-chevron-down');
                    this.innerHTML = `<i class="fas fa-chevron-down"></i> Ver detalles`;
                } else {
                    icono.classList.remove('fa-chevron-down');
                    icono.classList.add('fa-chevron-up');
                    this.innerHTML = `<i class="fas fa-chevron-up"></i> Ocultar detalles`;
                }
            });
        });
    }

    /**
     * Exporta el historial de visitas a un archivo
     */
    function exportarHistorial() {
        // En una implementación real, esto generaría un archivo PDF o Excel
        // Por ahora, mostramos un mensaje de confirmación
        alert('La función de exportación estará disponible pronto. Se está trabajando en la generación de informes en PDF y Excel.');
    }

    /**
     * Genera un PDF con los detalles de la visita
     * @param {Object} visita - Datos de la visita
     */
    function generarPDF(visita) {
        // En una implementación real, esto generaría un PDF con jsPDF o similar
        alert(`Generando PDF para la visita del ${visita.fecha} de ${visita.mascota}...`);
        console.log('Generando PDF para:', visita);
    }
});