/**
 * Clase que representa una cita veterinaria en el sistema
 * Contiene la información básica de una cita y métodos para manipularla
 */
class Appointment {
  /**
   * Constructor de la clase Appointment
   * @param {number} id - Identificador único de la cita
   * @param {number} petId - Identificador de la mascota asociada a la cita
   * @param {number} userId - Identificador del usuario dueño de la mascota
   * @param {Date} appointmentDate - Fecha y hora de la cita
   * @param {string} reason - Motivo de la cita
   * @param {string} status - Estado de la cita (programada, completada, cancelada)
   * @param {string} notes - Notas o comentarios sobre la cita
   * @param {string} treatment - Tratamiento aplicado durante la cita
   */
  constructor(id, petId, userId, appointmentDate, reason, status = 'programada', notes = '', treatment = '') {
    this.id = id;
    this.petId = petId;
    this.userId = userId;
    this.appointmentDate = appointmentDate;
    this.reason = reason;
    this.status = status;
    this.notes = notes;
    this.treatment = treatment;
  }

  /**
   * Valida los datos de la cita
   * @returns {boolean} - true si los datos son válidos, false en caso contrario
   */
  validate() {
    // Verificar que todos los campos requeridos estén presentes
    if (!this.petId || !this.userId || !this.appointmentDate || !this.reason) {
      return false;
    }

    // Validar que los IDs sean números
    if (typeof this.petId !== 'number' || typeof this.userId !== 'number') {
      return false;
    }

    // Validar que la fecha sea válida y futura (para citas nuevas)
    if (!(this.appointmentDate instanceof Date) || isNaN(this.appointmentDate)) {
      return false;
    }

    // Para citas nuevas, validar que la fecha sea futura
    if (this.status === 'programada' && this.appointmentDate < new Date()) {
      return false;
    }

    // Validar que el estado sea uno de los permitidos
    const validStatus = ['programada', 'completada', 'cancelada'];
    if (!validStatus.includes(this.status)) {
      return false;
    }

    return true;
  }

  /**
   * Convierte el objeto a formato JSON para su serialización
   * @returns {object} - Representación JSON de la cita
   */
  toJSON() {
    return {
      id: this.id,
      petId: this.petId,
      userId: this.userId,
      appointmentDate: this.appointmentDate,
      reason: this.reason,
      status: this.status,
      notes: this.notes,
      treatment: this.treatment
    };
  }
}

// Exportar la clase para poder usarla en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Appointment;
}