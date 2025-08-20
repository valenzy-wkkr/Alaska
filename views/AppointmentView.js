/**
 * Clase para manejar la funcionalidad de la vista de citas
 * Extiende la funcionalidad de FormView para el formulario de citas
 */
class AppointmentView extends FormView {
  /**
   * Constructor de la clase AppointmentView
   * @param {HTMLFormElement} formElement - El elemento del formulario de citas
   * @param {HTMLElement} historialElement - El elemento donde se muestra el historial
   * @param {HTMLSelectElement} filtroMascotaElement - El elemento de filtro de mascotas
   */
  constructor(formElement, historialElement, filtroMascotaElement) {
    super(formElement);
    
    this.historialElement = historialElement;
    this.filtroMascotaElement = filtroMascotaElement;
    
    // Elementos para mensajes
    this.mensajeExito = document.getElementById('mensaje-exito');
    this.mensajeError = document.getElementById('mensaje-error');
    
    // Controladores
    this.appointmentController = null;
    this.petController = null;
    
    // Estado
    this.mascotas = [];
    this.citas = [];
    this.userId = 1; // En una aplicación real, esto vendría de la sesión del usuario
    
    // Inicializar
    this.initControllers();
    this.loadPets();
    this.loadAppointments();
    this.initFilterListeners();
  }
  
  /**
   * Inicializa los controladores necesarios
   */
  async initControllers() {
    try {
      // En una aplicación real, estos controladores se inyectarían
      const dbConnection = new DatabaseConnection();
      await dbConnection.connect();
      
      const petDAO = new PetDAO(dbConnection);
      const appointmentDAO = new AppointmentDAO(dbConnection);
      const validator = new Validator();
      const errorHandler = new ErrorHandler();
      
      this.petController = new PetController(petDAO, validator, errorHandler);
      this.appointmentController = new AppointmentController(
        appointmentDAO,
        petDAO,
        validator,
        errorHandler
      );
    } catch (error) {
      console.error('Error al inicializar controladores:', error);
      this.showError('No se pudieron cargar los datos necesarios. Por favor, recarga la página.');
    }
  }
  
  /**
   * Carga las mascotas del usuario actual
   */
  async loadPets() {
    try {
      if (!this.petController) return;
      
      const result = await this.petController.getPetsByUserId(this.userId);
      
      if (result.success) {
        this.mascotas = result.pets;
        this.populatePetSelects();
      } else {
        this.showError('No se pudieron cargar las mascotas.');
      }
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      this.showError('Error al cargar las mascotas. Por favor, intenta de nuevo.');
    }
  }
  
  /**
   * Carga las citas del usuario actual
   */
  async loadAppointments() {
    try {
      if (!this.appointmentController) return;
      
      const result = await this.appointmentController.getAppointmentsByUserId(this.userId);
      
      if (result.success) {
        this.citas = result.appointments;
        this.renderAppointments();
      } else {
        this.showError('No se pudieron cargar las citas.');
      }
    } catch (error) {
      console.error('Error al cargar citas:', error);
      this.showError('Error al cargar las citas. Por favor, intenta de nuevo.');
    }
  }
  
  /**
   * Rellena los selectores de mascotas
   */
  populatePetSelects() {
    // Selector de mascota en el formulario
    const mascotaSelect = this.fields.petId;
    // Selector de filtro de mascota
    const filtroMascotaSelect = this.filtroMascotaElement;
    
    if (mascotaSelect) {
      // Limpiar opciones existentes excepto la primera
      while (mascotaSelect.options.length > 1) {
        mascotaSelect.remove(1);
      }
      
      // Agregar opciones de mascotas
      this.mascotas.forEach(mascota => {
        const option = document.createElement('option');
        option.value = mascota.id;
        option.textContent = mascota.name;
        mascotaSelect.appendChild(option);
      });
    }
    
    if (filtroMascotaSelect) {
      // Limpiar opciones existentes excepto la primera
      while (filtroMascotaSelect.options.length > 1) {
        filtroMascotaSelect.remove(1);
      }
      
      // Agregar opciones de mascotas
      this.mascotas.forEach(mascota => {
        const option = document.createElement('option');
        option.value = mascota.id;
        option.textContent = mascota.name;
        filtroMascotaSelect.appendChild(option);
      });
    }
  }
  
  /**
   * Inicializa los listeners para el filtro de mascotas
   */
  initFilterListeners() {
    if (this.filtroMascotaElement) {
      this.filtroMascotaElement.addEventListener('change', () => {
        this.renderAppointments();
      });
    }
  }
  
  /**
   * Renderiza las citas en el historial
   */
  renderAppointments() {
    if (!this.historialElement) return;
    
    // Obtener el filtro seleccionado
    const filtroMascotaId = this.filtroMascotaElement ? 
      parseInt(this.filtroMascotaElement.value) : null;
    
    // Filtrar citas si es necesario
    let citasFiltradas = this.citas;
    if (filtroMascotaId) {
      citasFiltradas = this.citas.filter(cita => cita.petId === filtroMascotaId);
    }
    
    // Limpiar el contenedor
    this.historialElement.innerHTML = '';
    
    // Mostrar mensaje si no hay citas
    if (citasFiltradas.length === 0) {
      const sinCitas = document.createElement('div');
      sinCitas.className = 'sin-citas';
      sinCitas.innerHTML = `
        <i class="fas fa-calendar-times fa-3x"></i>
        <p>No hay citas registradas</p>
      `;
      this.historialElement.appendChild(sinCitas);
      return;
    }
    
    // Ordenar citas por fecha (más recientes primero)
    citasFiltradas.sort((a, b) => {
      return new Date(b.appointmentDate) - new Date(a.appointmentDate);
    });
    
    // Crear elementos para cada cita
    citasFiltradas.forEach(cita => {
      // Encontrar la mascota correspondiente
      const mascota = this.mascotas.find(m => m.id === cita.petId);
      const nombreMascota = mascota ? mascota.name : 'Mascota desconocida';
      
      // Formatear fecha
      const fecha = new Date(cita.appointmentDate);
      const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      const horaFormateada = fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Crear elemento de cita
      const citaElement = document.createElement('div');
      citaElement.className = 'cita-item';
      
      // Determinar clase de estado
      let estadoClase = '';
      switch (cita.status) {
        case 'programada':
          estadoClase = 'estado-programada';
          break;
        case 'completada':
          estadoClase = 'estado-completada';
          break;
        case 'cancelada':
          estadoClase = 'estado-cancelada';
          break;
        default:
          estadoClase = 'estado-programada';
      }
      
      // Contenido HTML de la cita
      citaElement.innerHTML = `
        <div class="cita-header">
          <span class="cita-fecha">${fechaFormateada} - ${horaFormateada}</span>
          <span class="cita-estado ${estadoClase}">${cita.status}</span>
        </div>
        <div class="cita-mascota">${nombreMascota}</div>
        <div class="cita-razon">${cita.reason}</div>
        ${cita.notes ? `<div class="cita-notas">${cita.notes}</div>` : ''}
        ${cita.treatment ? `
          <div class="cita-tratamiento">
            <h5>Tratamiento:</h5>
            <p>${cita.treatment}</p>
          </div>
        ` : ''}
      `;
      
      this.historialElement.appendChild(citaElement);
    });
  }
  
  /**
   * Obtiene las reglas de validación para el formulario de citas
   * @returns {object} - Las reglas de validación
   */
  getValidationRules() {
    return {
      petId: ['required', 'numeric'],
      appointmentDate: ['required', 'date', 'future'],
      reason: ['required']
    };
  }
  
  /**
   * Envía los datos del formulario al servidor
   * @param {object} data - Los datos del formulario
   */
  async submitForm(data) {
    try {
      // Mostrar estado de carga
      this.showLoadingState();
      
      // Preparar datos para enviar
      const appointmentData = {
        petId: parseInt(data.petId),
        userId: this.userId,
        appointmentDate: data.appointmentDate,
        reason: data.reason,
        notes: data.notes || '',
        status: 'programada'
      };
      
      // Enviar datos al controlador
      const result = await this.appointmentController.createAppointment(appointmentData);
      
      if (result.success) {
        // Mostrar mensaje de éxito
        this.showSuccess('Cita reservada exitosamente');
        
        // Recargar citas
        await this.loadAppointments();
        
        // Resetear formulario
        this.resetForm();
      } else {
        // Mostrar mensaje de error
        this.showError(result.message || 'Error al reservar la cita');
      }
    } catch (error) {
      // Manejar errores
      console.error('Error al enviar formulario de cita:', error);
      this.showError('Ocurrió un error al reservar la cita. Por favor, inténtalo de nuevo.');
    } finally {
      // Ocultar estado de carga
      this.hideLoadingState();
    }
  }
  
  /**
   * Muestra un mensaje de éxito
   * @param {string} message - El mensaje a mostrar
   */
  showSuccess(message) {
    if (this.mensajeExito) {
      this.mensajeExito.textContent = message;
      this.mensajeExito.style.display = 'block';
      this.mensajeError.style.display = 'none';
      
      // Ocultar después de 5 segundos
      setTimeout(() => {
        this.mensajeExito.style.display = 'none';
      }, 5000);
    }
  }
  
  /**
   * Muestra un mensaje de error
   * @param {string} message - El mensaje a mostrar
   */
  showError(message) {
    if (this.mensajeError) {
      this.mensajeError.textContent = message;
      this.mensajeError.style.display = 'block';
      this.mensajeExito.style.display = 'none';
      
      // Ocultar después de 5 segundos
      setTimeout(() => {
        this.mensajeError.style.display = 'none';
      }, 5000);
    }
  }
  
  /**
   * Muestra el estado de carga
   */
  showLoadingState() {
    if (this.submitButton) {
      this.submitButton.disabled = true;
      this.submitButton.textContent = 'Reservando...';
    }
  }
  
  /**
   * Oculta el estado de carga
   */
  hideLoadingState() {
    if (this.submitButton) {
      this.submitButton.disabled = false;
      this.submitButton.textContent = 'Reservar Cita';
    }
  }
}

// Inicializar la vista cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const formularioCitas = document.getElementById('formulario-citas');
  const listaCitas = document.getElementById('lista-citas');
  const filtroMascota = document.getElementById('filtro-mascota');
  
  if (formularioCitas && listaCitas) {
    new AppointmentView(formularioCitas, listaCitas, filtroMascota);
  }
});