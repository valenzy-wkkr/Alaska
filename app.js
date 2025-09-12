/**
 * Archivo principal de la aplicación
 * Inicializa todos los componentes y configura la aplicación
 */

// NOTA: Este archivo se ejecuta en el navegador. Evitar require de módulos Node.
// Las clases vistas y utilidades se cargan vía <script> en index.html

// Accesos seguros a clases globales si están disponibles
const MenuView = window.MenuView || (typeof require !== 'undefined' ? require('./views/MenuView') : null);
const ButtonView = window.ButtonView || (typeof require !== 'undefined' ? require('./views/ButtonView') : null);
const FormView = window.FormView || (typeof require !== 'undefined' ? require('./views/FormView') : null);
const Validator = window.Validator || (typeof require !== 'undefined' ? require('./utils/Validator') : null);
const ErrorHandlerClass = (window.ErrorHandler ? window.ErrorHandler : (typeof require !== 'undefined' ? require('./utils/ErrorHandler').ErrorHandler : null));

/**
 * Clase principal de la aplicación
 */
class App {
  /**
   * Constructor de la aplicación
   */
  constructor() {
    // Componentes principales
  // Backend no disponible en cliente. Nos enfocamos en vistas.
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
  // Logger simple en navegador
  this.logger = console;
  this.logger.info && this.logger.info('Iniciando aplicación');
      
      // Inicializar manejador de errores
  this.errorHandler = ErrorHandlerClass ? new ErrorHandlerClass() : { handleError: console.error };
      
      // Inicializar validador
  this.validator = Validator ? new Validator() : null;
      
      // Inicializar conexión a base de datos
  // Saltar inicialización de base de datos en cliente
      
      // Inicializar controladores
  // Saltar controladores en cliente
      
      // Inicializar vistas
      this.initViews();
      
      // Marcar como inicializada
      this.isInitialized = true;
      
  this.logger.info && this.logger.info('Aplicación inicializada correctamente');
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
  this.menuView = MenuView ? new MenuView() : null;
  this.menuView && this.menuView.init();
      
      // Establecer enlace activo según la ruta actual
  const path = window.location.hash || window.location.pathname;
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
  const buttons = document.querySelectorAll('button, .boton-primario, .boton-secundario, a.boton-primario, a.boton-secundario');
      
      buttons.forEach(button => {
        // No interferir con botones de los formularios manejados por auth.js
        const inAuthForm = !!button.closest('#formulario-login, #formulario-registro');
        if (inAuthForm) {
          return;
        }
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
  const buttonView = ButtonView ? new ButtonView(button, type, action) : null;
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
        // Evitar conflicto con formularios manejados por auth.js
        const id = (form.id || '').toLowerCase();
        if (id === 'formulario-login' || id === 'formulario-registro') {
          return; // Estos los maneja utils/auth.js
        }
        // Crear vista de formulario
  const formView = FormView ? new FormView(form) : null;
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
  // No hay base de datos en cliente
      
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
    // Ajuste automático de enlaces si se ejecuta sin servidor (file://)
    (function adaptLinksForEnv(){
      try{
        const routeMap = new Map([
          ['/', './index.html'],
          ['/blog', './blog.html'],
          ['/contacto', './contacto.html'],
          ['/login', './login.html'],
          ['/dashboard', './dashboard.html']
        ]);
        // Alias y variantes comunes
        const aliasMap = new Map([
          ['/iniciar-sesion', './login.html'],
          ['/iniciar sesión', './login.html'],
          ['/iniciar%20sesion', './login.html'],
          ['/iniciar%20sesi%C3%B3n', './login.html'],
          ['/contactos', './contacto.html'],
          ['/contactos.html', './contacto.html']
        ]);
        function toRelative(href){
          if (!href || typeof href !== 'string') return href;
          // Mantener externos o anclas puras
          if (/^(https?:)?\/\//i.test(href) || href.startsWith('#')) return href;
          // /#seccion => ./index.html#seccion
          if (href.startsWith('/#')) return './index.html' + href.slice(1);
          // /ruta base => ./archivo.html
          if (routeMap.has(href)) return routeMap.get(href);
          if (aliasMap.has(href)) return aliasMap.get(href);
          return href; // dejar otros intactos
        }
        const adaptAll = () => document.querySelectorAll('a[href]')
          .forEach(a => { const fixed = toRelative(a.getAttribute('href')); if (fixed !== a.getAttribute('href')) a.setAttribute('href', fixed); });

        if (location.protocol === 'file:') {
          adaptAll();
          return;
        }
        // En HTTP/HTTPS: detectar si el servidor NO soporta rutas bonitas y adaptar
        fetch('/blog', { cache: 'no-store' }).then(r => {
          if (!r || !r.ok) adaptAll();
        }).catch(() => adaptAll());
      }catch{ /* no-op */ }
    })();

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