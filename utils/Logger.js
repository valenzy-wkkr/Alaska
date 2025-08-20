/**
 * Clase para manejar el registro de logs en la aplicación
 * Proporciona métodos para registrar diferentes niveles de logs
 */
class Logger {
  /**
   * Constructor de la clase Logger
   * @param {string} logFile - La ruta al archivo de logs
   */
  constructor(logFile = './logs/app.log') {
    this.logFile = logFile;
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.currentLogLevel = 'INFO'; // Nivel de log por defecto
    
    // Definir niveles de log con prioridades
    this.logLevels = {
      'ERROR': 0,
      'WARN': 1,
      'INFO': 2,
      'DEBUG': 3
    };
  }

  /**
   * Registra un mensaje con nivel y contexto
   * @param {string} message - El mensaje a registrar
   * @param {string} level - El nivel de log (ERROR, WARN, INFO, DEBUG)
   * @param {string} context - El contexto del log
   */
  log(message, level = 'INFO', context = '') {
    // Verificar si el nivel de log actual permite registrar este mensaje
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = this.formatLogEntry(message, level, timestamp, context);
    
    // En una implementación real, esto escribiría en un archivo
    console.log(logEntry);
    
    // Para una implementación completa, se usaría:
    // this.writeToFile(logEntry);
  }

  /**
   * Registra un error
   * @param {string} message - El mensaje de error
   * @param {string} context - El contexto del error
   */
  error(message, context = '') {
    this.log(message, 'ERROR', context);
  }

  /**
   * Registra una advertencia
   * @param {string} message - El mensaje de advertencia
   * @param {string} context - El contexto de la advertencia
   */
  warn(message, context = '') {
    this.log(message, 'WARN', context);
  }

  /**
   * Registra información
   * @param {string} message - El mensaje de información
   * @param {string} context - El contexto de la información
   */
  info(message, context = '') {
    this.log(message, 'INFO', context);
  }

  /**
   * Registra mensaje de depuración
   * @param {string} message - El mensaje de depuración
   * @param {string} context - El contexto del mensaje de depuración
   */
  debug(message, context = '') {
    this.log(message, 'DEBUG', context);
  }

  /**
   * Rota el archivo de logs cuando alcanza el tamaño máximo
   */
  rotateLogFile() {
    // En una implementación real, esto rotaría el archivo de logs
    console.log('Rotando archivo de logs...');
  }

  /**
   * Formatea una entrada de log
   * @param {string} message - El mensaje a registrar
   * @param {string} level - El nivel de log
   * @param {string} timestamp - La marca de tiempo
   * @param {string} context - El contexto del log
   * @returns {string} - La entrada de log formateada
   */
  formatLogEntry(message, level, timestamp, context) {
    return `[${timestamp}] [${level}] ${context ? `[${context}] ` : ''}${message}`;
  }

  /**
   * Escribe una entrada en el archivo de logs
   * @param {string} entry - La entrada a escribir
   */
  writeToFile(entry) {
    // En una implementación real, esto escribiría en un archivo
    // Usando fs.appendFileSync o similar
    console.log('Escribiendo en archivo de logs:', entry);
  }

  /**
   * Envía una entrada a la base de datos (opcional)
   * @param {string} entry - La entrada a enviar
   */
  sendToDatabase(entry) {
    // En una implementación real, esto enviaría el log a una base de datos
    console.log('Enviando log a base de datos:', entry);
  }

  /**
   * Establece el nivel de logging
   * @param {string} level - El nivel de log
   */
  setLogLevel(level) {
    if (this.logLevels[level] !== undefined) {
      this.currentLogLevel = level;
    } else {
      console.warn(`Nivel de log desconocido: ${level}`);
    }
  }

  /**
   * Verifica si un mensaje debería ser registrado según su nivel
   * @param {string} level - El nivel de log del mensaje
   * @returns {boolean} - true si el mensaje debería ser registrado, false en caso contrario
   */
  shouldLog(level) {
    const currentLevelPriority = this.logLevels[this.currentLogLevel];
    const messageLevelPriority = this.logLevels[level];
    
    // Si el nivel del mensaje es menor o igual al nivel actual, se registra
    return messageLevelPriority <= currentLevelPriority;
  }

  /**
   * Obtiene el nivel de log actual
   * @returns {string} - El nivel de log actual
   */
  getLogLevel() {
    return this.currentLogLevel;
  }

  /**
   * Cierra el logger y libera recursos
   */
  close() {
    console.log('Cerrando logger...');
  }
}

// Exportar la clase para poder usarla en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Logger;
}