/**
 * Archivo de configuración de la aplicación
 * Contiene las configuraciones generales de la aplicación
 */

// Configuración de la base de datos
const databaseConfig = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'AlaskaPets',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'TuContraseñaSegura123',
  options: {
    encrypt: true, // Usar en producción
    trustServerCertificate: true // Solo para desarrollo
  }
};

// Configuración de la aplicación
const appConfig = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'INFO'
};

// Configuración de seguridad
const securityConfig = {
  jwtSecret: process.env.JWT_SECRET || 'secreto_jwt_por_defecto',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10
};

// Configuración de validación
const validationConfig = {
  minLength: {
    password: 8,
    name: 2,
    username: 3,
    address: 5
  },
  maxLength: {
    username: 20
  }
};

// Configuración de logs
const logConfig = {
  file: process.env.LOG_FILE || './logs/app.log',
  maxSize: process.env.LOG_MAX_SIZE || '5M',
  maxFiles: process.env.LOG_MAX_FILES || '7d'
};

// Exportar configuraciones
module.exports = {
  databaseConfig,
  appConfig,
  securityConfig,
  validationConfig,
  logConfig
};