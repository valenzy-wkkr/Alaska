// Clase para manejar las operaciones de citas
class CitasManager {
    constructor() {
        this.apiUrl = 'php/procesar_citas.php';
        this.citas = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.cargarCitas();
        this.configurarFechaMinima();
    }

    bindEvents() {
        // Formulario de nueva cita
        const formulario = document.getElementById('formulario-citas');
        if (formulario) {
            formulario.addEventListener('submit', (e) => this.manejarEnvioFormulario(e));
        }

        // Filtro de mascotas
        const filtroMascota = document.getElementById('filtro-mascota');
        if (filtroMascota) {
            filtroMascota.addEventListener('change', () => this.filtrarCitas());
        }

        // Botón de exportar
        const btnExportar = document.getElementById('btn-exportar');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => this.exportarHistorial());
        }
    }

    configurarFechaMinima() {
        const inputFecha = document.getElementById('fecha');
        if (inputFecha) {
            const ahora = new Date();
            const fechaMinima = ahora.toISOString().slice(0, 16);
            inputFecha.min = fechaMinima;
        }
    }

    async cargarCitas() {
        try {
            const respuesta = await fetch(this.apiUrl);
            const resultado = await respuesta.json();
            
            if (resultado.exito) {
                this.citas = resultado.datos || [];
                this.mostrarCitas();
            } else {
                this.mostrarError('Error al cargar las citas: ' + resultado.mensaje);
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError('Error de conexión al cargar las citas');
        }
    }

    async manejarEnvioFormulario(evento) {
        evento.preventDefault();
        
        const formulario = evento.target;
        const datos = new FormData(formulario);
        
        // Convertir FormData a objeto
        const datosCita = {};
        for (let [clave, valor] of datos.entries()) {
            datosCita[clave] = valor;
        }

        try {
            const respuesta = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosCita)
            });

            const resultado = await respuesta.json();
            
            if (resultado.exito) {
                this.mostrarExito('Cita creada exitosamente');
                formulario.reset();
                this.cargarCitas(); // Recargar la lista
            } else {
                this.mostrarError('Error al crear la cita: ' + resultado.mensaje);
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError('Error de conexión al crear la cita');
        }
    }

    mostrarCitas() {
        const contenedor = document.getElementById('lista-citas');
        if (!contenedor) return;

        const filtro = document.getElementById('filtro-mascota')?.value || 'todas';
        let citasFiltradas = this.citas;

        if (filtro !== 'todas') {
            citasFiltradas = this.citas.filter(cita => cita.tipo_mascota === filtro);
        }

        if (citasFiltradas.length === 0) {
            contenedor.innerHTML = `
                <div class="sin-citas">
                    <i class="fas fa-calendar-times fa-3x"></i>
                    <p>No hay citas registradas</p>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = citasFiltradas.map(cita => this.crearTarjetaCita(cita)).join('');
        this.bindEventosTarjetas();
    }

    crearTarjetaCita(cita) {
        const fecha = new Date(cita.fecha_cita);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const horaFormateada = fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const estadoClass = this.obtenerClaseEstado(cita.estado);
        const estadoTexto = this.obtenerTextoEstado(cita.estado);

        // Mostrar nombre de la mascota si existe, si no, mostrar tipo de mascota
        const nombreMascota = cita.nombre_mascota ? `${cita.nombre_mascota} (${cita.tipo_mascota})` : cita.tipo_mascota;

        return `
            <div class="tarjeta-visita" data-id="${cita.id}">
                <div class="cabecera-tarjeta">
                    <div class="fecha-visita">
                        <i class="far fa-calendar-alt"></i>
                        <span class="fecha">${fechaFormateada} ${horaFormateada}</span>
                    </div>
                    <div class="mascota">
                        <i class="fas fa-paw"></i>
                        <span class="nombre-mascota">${nombreMascota}</span>
                    </div>
                    <span class="estado ${estadoClass}">${estadoTexto}</span>
                </div>
                <div class="cuerpo-tarjeta">
                    <div class="detalle">
                        <h4>Motivo</h4>
                        <p class="motivo">${cita.motivo}</p>
                    </div>
                    ${cita.diagnostico ? `
                        <div class="detalle">
                            <h4>Diagnóstico</h4>
                            <p class="diagnostico">${cita.diagnostico}</p>
                        </div>
                    ` : ''}
                    ${cita.tratamiento ? `
                        <div class="detalle">
                            <h4>Tratamiento</h4>
                            <p class="tratamiento">${cita.tratamiento}</p>
                        </div>
                    ` : ''}
                    ${cita.veterinario ? `
                        <div class="detalle">
                            <h4>Veterinario</h4>
                            <p class="veterinario">${cita.veterinario}</p>
                        </div>
                    ` : ''}
                    <button class="boton-detalles" aria-expanded="false">
                        <i class="fas fa-chevron-down"></i> Ver detalles
                    </button>
                    <div class="detalles-adicionales" aria-hidden="true">
                        ${cita.notas ? `
                            <h5>Notas adicionales:</h5>
                            <p class="notas">${cita.notas}</p>
                        ` : ''}
                        <div class="acciones">
                            <button class="boton-texto" onclick="citasManager.editarCita(${cita.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="boton-texto" onclick="citasManager.eliminarCita(${cita.id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                            <button class="boton-texto" onclick="citasManager.imprimirCita(${cita.id})">
                                <i class="fas fa-print"></i> Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEventosTarjetas() {
        // Botones de detalles
        document.querySelectorAll('.boton-detalles').forEach(boton => {
            boton.addEventListener('click', (e) => {
                const tarjeta = e.target.closest('.tarjeta-visita');
                const detalles = tarjeta.querySelector('.detalles-adicionales');
                const isExpanded = boton.getAttribute('aria-expanded') === 'true';
                
                boton.setAttribute('aria-expanded', !isExpanded);
                detalles.setAttribute('aria-hidden', isExpanded);
                
                // Rotar icono
                const icono = boton.querySelector('i');
                icono.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
            });
        });
    }

    obtenerClaseEstado(estado) {
        const estados = {
            'programada': 'pendiente',
            'completada': 'completada',
            'cancelada': 'cancelada'
        };
        return estados[estado] || 'pendiente';
    }

    obtenerTextoEstado(estado) {
        const estados = {
            'programada': 'Programada',
            'completada': 'Completada',
            'cancelada': 'Cancelada'
        };
        return estados[estado] || 'Programada';
    }

    filtrarCitas() {
        this.mostrarCitas();
    }

    async editarCita(id) {
        const cita = this.citas.find(c => c.id == id);
        if (!cita) return;

        // Aquí podrías abrir un modal de edición
        // Por ahora, solo mostramos un prompt simple
        const nuevoEstado = prompt('Nuevo estado (programada/completada/cancelada):', cita.estado);
        if (nuevoEstado && nuevoEstado !== cita.estado) {
            await this.actualizarCita(id, { estado: nuevoEstado });
        }
    }

    async actualizarCita(id, datos) {
        try {
            const respuesta = await fetch(this.apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, ...datos })
            });

            const resultado = await respuesta.json();
            
            if (resultado.exito) {
                this.mostrarExito('Cita actualizada exitosamente');
                this.cargarCitas();
            } else {
                this.mostrarError('Error al actualizar la cita: ' + resultado.mensaje);
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError('Error de conexión al actualizar la cita');
        }
    }

    async eliminarCita(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
            return;
        }

        try {
            const respuesta = await fetch(`${this.apiUrl}?id=${id}`, {
                method: 'DELETE'
            });

            const resultado = await respuesta.json();
            
            if (resultado.exito) {
                this.mostrarExito('Cita eliminada exitosamente');
                this.cargarCitas();
            } else {
                this.mostrarError('Error al eliminar la cita: ' + resultado.mensaje);
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError('Error de conexión al eliminar la cita');
        }
    }

    imprimirCita(id) {
        const cita = this.citas.find(c => c.id == id);
        if (!cita) return;

        const ventanaImpresion = window.open('', '_blank');
        const fecha = new Date(cita.fecha_cita);
        
        ventanaImpresion.document.write(`
            <html>
                <head>
                    <title>Cita Veterinaria - ${cita.tipo_mascota}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; border-bottom: 2px solid #1976d2; padding-bottom: 10px; }
                        .info { margin: 20px 0; }
                        .info h3 { color: #1976d2; }
                        .info p { margin: 5px 0; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>ALASKA - Clínica Veterinaria</h1>
                        <h2>Informe de Cita</h2>
                    </div>
                    <div class="info">
                        <h3>Información de la Cita</h3>
                        <p><strong>Fecha:</strong> ${fecha.toLocaleDateString('es-ES')}</p>
                        <p><strong>Hora:</strong> ${fecha.toLocaleTimeString('es-ES')}</p>
                        <p><strong>Mascota:</strong> ${cita.tipo_mascota}</p>
                        <p><strong>Motivo:</strong> ${cita.motivo}</p>
                        <p><strong>Estado:</strong> ${cita.estado}</p>
                        ${cita.diagnostico ? `<p><strong>Diagnóstico:</strong> ${cita.diagnostico}</p>` : ''}
                        ${cita.tratamiento ? `<p><strong>Tratamiento:</strong> ${cita.tratamiento}</p>` : ''}
                        ${cita.veterinario ? `<p><strong>Veterinario:</strong> ${cita.veterinario}</p>` : ''}
                        ${cita.notas ? `<p><strong>Notas:</strong> ${cita.notas}</p>` : ''}
                    </div>
                </body>
            </html>
        `);
        
        ventanaImpresion.document.close();
        ventanaImpresion.print();
    }

    exportarHistorial() {
        const filtro = document.getElementById('filtro-mascota')?.value || 'todas';
        let citasFiltradas = this.citas;

        if (filtro !== 'todas') {
            citasFiltradas = this.citas.filter(cita => cita.tipo_mascota === filtro);
        }

        if (citasFiltradas.length === 0) {
            this.mostrarError('No hay citas para exportar');
            return;
        }

        // Crear CSV
        const headers = ['Fecha', 'Hora', 'Mascota', 'Motivo', 'Estado', 'Diagnóstico', 'Tratamiento', 'Veterinario', 'Notas'];
        const csvContent = [
            headers.join(','),
            ...citasFiltradas.map(cita => {
                const fecha = new Date(cita.fecha_cita);
                return [
                    fecha.toLocaleDateString('es-ES'),
                    fecha.toLocaleTimeString('es-ES'),
                    `"${cita.tipo_mascota}"`,
                    `"${cita.motivo}"`,
                    `"${cita.estado}"`,
                    `"${cita.diagnostico || ''}"`,
                    `"${cita.tratamiento || ''}"`,
                    `"${cita.veterinario || ''}"`,
                    `"${cita.notas || ''}"`
                ].join(',');
            })
        ].join('\n');

        // Descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `historial_citas_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    mostrarExito(mensaje) {
        this.mostrarMensaje(mensaje, 'exito');
    }

    mostrarError(mensaje) {
        this.mostrarMensaje(mensaje, 'error');
    }

    mostrarMensaje(mensaje, tipo) {
        // Ocultar mensajes anteriores
        document.querySelectorAll('.mensaje-exito, .mensaje-error').forEach(el => {
            el.style.display = 'none';
        });

        const elemento = document.getElementById(`mensaje-${tipo}`);
        if (elemento) {
            elemento.textContent = mensaje;
            elemento.style.display = 'block';
            
            // Ocultar después de 5 segundos
            setTimeout(() => {
                elemento.style.display = 'none';
            }, 5000);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.citasManager = new CitasManager();
});
