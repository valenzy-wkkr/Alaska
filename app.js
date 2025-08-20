/**
 * Archivo principal de la aplicación
 * Inicializa todos los componentes y configura la aplicación
 */

// Importar dependencias
const { DatabaseConnection } = require('./database/DatabaseConnection');
const UserDAO = require('./database/UserDAO');
const PetDAO = require('./database/PetDAO');
const UserController = require('./controllers/UserController');
const PetController = require('./controllers/PetController');
const Validator = require('./utils/Validator');
const { ErrorHandler } = require('./utils/ErrorHandler');
const Logger = require('./utils/Logger');
const MenuView = require('./views/MenuView');
const ButtonView = require('./views/ButtonView');
const FormView = require('./views/FormView');

// Clases de modelo
const User = require('./models/User');
const Pet = require('./models/Pet');

/**
 * Clase principal de la aplicación
 */
class App {
  /**
   * Constructor de la aplicación
   */
  constructor() {
    // Componentes principales
    this.database = null;
    this.userDAO = null;
    this.petDAO = null;
    this.userController = null;
    this.petController = null;
    this.validator = null;
    this.errorHandler = null;
    this.logger = null;
    
    // Vistas
    this.menuView = null;
    this.buttonViews = [];
    this.formViews = [];
    
    // Estado de la aplicación
    this.isInitialized = false;
  }

  /**
   * Inicializa la aplicación
   */
  async init() {
    try {
      // Inicializar logger
      this.logger = new Logger('./logs/app.log');
      this.logger.info('Iniciando aplicación');
      
      // Inicializar manejador de errores
      this.errorHandler = new ErrorHandler();
      
      // Inicializar validador
      this.validator = new Validator();
      
      // Inicializar conexión a base de datos
      await this.initDatabase();
      
      // Inicializar controladores
      this.initControllers();
      
      // Inicializar vistas
      this.initViews();
      
      // Marcar como inicializada
      this.isInitialized = true;
      
      this.logger.info('Aplicación inicializada correctamente');
      console.log('Aplicación inicializada correctamente');
    } catch (error) {
      this.errorHandler.handleError(error, 'App.init');
      throw error;
    }
  }

  /**
   * Inicializa la conexión a la base de datos
   */
  async initDatabase() {
    try {
      this.database = new DatabaseConnection();
      await this.database.connect();
      
      // Inicializar DAOs
      this.userDAO = new UserDAO(this.database);
      this.petDAO = new PetDAO(this.database);
      
      this.logger.info('Conexión a base de datos establecida');
    } catch (error) {
      this.errorHandler.handleError(error, 'App.initDatabase');
      throw error;
    }
  }

  /**
   * Inicializa los controladores
   */
  initControllers() {
    try {
      this.userController = new UserController(
        this.userDAO,
        this.validator,
        this.errorHandler
      );
      
      this.petController = new PetController(
        this.petDAO,
        this.validator,
        this.errorHandler
      );
      
      this.logger.info('Controladores inicializados');
    } catch (error) {
      this.errorHandler.handleError(error, 'App.initControllers');
      throw error;
    }
  }

  /**
   * Inicializa las vistas
   */
  initViews() {
    try {
      // Inicializar menú
      this.initMenuView();
      
      // Inicializar botones
      this.initButtonViews();
      
      // Inicializar formularios
      this.initFormViews();
      
      this.logger.info('Vistas inicializadas');
    } catch (error) {
      this.errorHandler.handleError(error, 'App.initViews');
      throw error;
    }
  }

  /**
   * Inicializa la vista del menú
   */
  initMenuView() {
    try {
      this.menuView = new MenuView();
      this.menuView.init();
      
      // Establecer enlace activo según la ruta actual
      const path = window.location.pathname;
      this.menuView.setActiveLink(path);
    } catch (error) {
      this.errorHandler.handleError(error, 'App.initMenuView');
    }
  }

  /**
   * Inicializa las vistas de botones
   */
  initButtonViews() {
    try {
      // Encontrar todos los botones en el documento
      const buttons = document.querySelectorAll('button, .boton-primario, .boton-secundario');
      
      buttons.forEach(button => {
        // Determinar tipo de botón
        let type = 'default';
        if (button.classList.contains('boton-primario')) {
          type = 'primario';
        } else if (button.classList.contains('boton-secundario')) {
          type = 'secundario';
        }
        
        // Determinar acción del botón
        let action = null;
        if (button.type === 'submit') {
          action = 'submit';
        } else if (button.type === 'reset') {
          action = 'reset';
        } else if (button.classList.contains('boton-registro')) {
          action = 'register';
        }
        
        // Crear vista de botón
        const buttonView = new ButtonView(button, type, action);
        this.buttonViews.push(buttonView);
      });
    } catch (error) {
      this.errorHandler.handleError(error, 'App.initButtonViews');
    }
  }

  /**
   * Inicializa las vistas de formularios
   */
  initFormViews() {
    try {
      // Encontrar todos los formularios en el documento
      const forms = document.querySelectorAll('form');
      
      forms.forEach(form => {
        // Crear vista de formulario
        const formView = new FormView(form);
        this.formViews.push(formView);
      });
    } catch (error) {
      this.errorHandler.handleError(error, 'App.initFormViews');
    }
  }

  /**
   * Crea un nuevo usuario
   * @param {object} userData - Los datos del usuario
   * @returns {Promise<object>} - El resultado de la operación
   */
  async createUser(userData) {
    if (!this.isInitialized) {
      throw new Error('La aplicación no está inicializada');
    }
    
    return await this.userController.createUser(userData);
  }

  /**
   * Crea una nueva mascota
   * @param {object} petData - Los datos de la mascota
   * @returns {Promise<object>} - El resultado de la operación
   */
  async createPet(petData) {
    if (!this.isInitialized) {
      throw new Error('La aplicación no está inicializada');
    }
    
    return await this.petController.createPet(petData);
  }

  /**
   * Obtiene un usuario por ID
   * @param {number} id - El ID del usuario
   * @returns {Promise<object>} - El resultado de la operación
   */
  async getUserById(id) {
    if (!this.isInitialized) {
      throw new Error('La aplicación no está inicializada');
    }
    
    return await this.userController.getUserById(id);
  }

  /**
   * Obtiene una mascota por ID
   * @param {number} id - El ID de la mascota
   * @returns {Promise<object>} - El resultado de la operación
   */
  async getPetById(id) {
    if (!this.isInitialized) {
      throw new Error('La aplicación no está inicializada');
    }
    
    return await this.petController.getPetById(id);
  }

  /**
   * Cierra la aplicación y libera recursos
   */
  async destroy() {
    try {
      // Destruir vistas
      if (this.menuView) {
        this.menuView.destroy();
      }
      
      this.buttonViews.forEach(buttonView => {
        buttonView.destroy();
      });
      
      this.formViews.forEach(formView => {
        formView.destroy();
      });
      
      // Cerrar conexión a base de datos
      if (this.database) {
        await this.database.disconnect();
      }
      
      // Cerrar logger
      if (this.logger) {
        this.logger.close();
      }
      
      this.isInitialized = false;
      
      this.logger.info('Aplicación cerrada correctamente');
    } catch (error) {
      this.errorHandler.handleError(error, 'App.destroy');
    }
  }
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Crear instancia de la aplicación
    const app = new App();
    
    // Inicializar la aplicación
    await app.init();
    
    // Guardar la instancia en el objeto global para acceso posterior
    window.App = app;
    
    console.log('Aplicación cargada y lista para usar');
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
  }
});

// Manejar cierre de la aplicación
window.addEventListener('beforeunload', async () => {
  if (window.App) {
    await window.App.destroy();
  }
});

// Exportar la clase App para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}