/**
 * Clase para manejar la funcionalidad del menú de navegación
 * Incluye la apertura y cierre del menú en dispositivos móviles
 */
class MenuView {
  /**
   * Constructor de la clase MenuView
   */
  constructor() {
    // Elementos del DOM
    this.menuButton = null;
    this.navigationMenu = null;
    this.menuItems = null;
    
    // Estado del menú
    this.isOpen = false;
    
    // Bind de métodos para mantener el contexto
    this.toggleMenuHandler = this.toggleMenu.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  /**
   * Inicializa la funcionalidad del menú
   */
  init() {
    // Obtener elementos del DOM
    this.menuButton = document.querySelector('.boton-menu-movil');
    this.navigationMenu = document.querySelector('.lista-navegacion');
    
    if (!this.menuButton || !this.navigationMenu) {
      console.warn('No se encontraron los elementos necesarios para el menú');
      return;
    }
    
    // Obtener items del menú
    this.menuItems = this.navigationMenu.querySelectorAll('a');
    
    // Inicializar event listeners
    this.initEventListeners();
    
    // Configurar estado inicial
    this.closeMenu();
  }

  /**
   * Inicializa los event listeners para el menú
   */
  initEventListeners() {
    // Evento para el botón de menú
    this.menuButton.addEventListener('click', this.toggleMenuHandler);
    
    // Evento para cerrar el menú al hacer clic en un enlace
    this.menuItems.forEach(item => {
      item.addEventListener('click', () => {
        if (this.isOpen) {
          this.closeMenu();
        }
      });
    });
    
    // Evento para cerrar el menú al hacer clic fuera de él
    document.addEventListener('click', this.handleClickOutside);
    
    // Evento para manejar el redimensionamiento de la ventana
    window.addEventListener('resize', this.handleResize);
  }
  
  /**
   * Maneja los clics fuera del menú para cerrarlo
   * @param {Event} event - El evento de clic
   */
  handleClickOutside(event) {
    if (this.isOpen && 
        !this.navigationMenu.contains(event.target) && 
        !this.menuButton.contains(event.target)) {
      this.closeMenu();
    }
  }

  /**
   * Alterna la visibilidad del menú en dispositivos móviles
   * @param {Event} event - El evento de clic
   */
  toggleMenu(event) {
    if (event) {
      event.preventDefault();
    }
    
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  /**
   * Cierra el menú
   */
  closeMenu() {
    this.navigationMenu.classList.remove('activo');
    this.menuButton.setAttribute('aria-label', 'Abrir menú');
    this.isOpen = false;
    
    // Enfocar el botón para accesibilidad
    this.menuButton.focus();
  }

  /**
   * Abre el menú
   */
  openMenu() {
    this.navigationMenu.classList.add('activo');
    this.menuButton.setAttribute('aria-label', 'Cerrar menú');
    this.isOpen = true;
    
    // Enfocar el primer elemento del menú para accesibilidad
    if (this.menuItems.length > 0) {
      this.menuItems[0].focus();
    }
  }

  /**
   * Establece el enlace activo en la navegación
   * @param {string} path - La ruta actual
   */
  setActiveLink(path) {
    // Remover clase activa de todos los enlaces
    this.menuItems.forEach(item => {
      item.classList.remove('activo');
    });
    
    // Encontrar el enlace que coincide con la ruta actual
    const activeLink = Array.from(this.menuItems).find(item => {
      const href = item.getAttribute('href');
      return href === path || (href && path.startsWith(href));
    });
    
    // Agregar clase activa al enlace encontrado
    if (activeLink) {
      activeLink.classList.add('activo');
    }
  }

  /**
   * Maneja el redimensionamiento de la ventana
   */
  handleResize() {
    // Si la ventana es lo suficientemente grande, cerrar el menú móvil
    if (window.innerWidth > 768) {
      this.closeMenu();
    }
  }

  /**
   * Destruye la instancia del menú (limpia event listeners)
   */
  destroy() {
    // Remover event listeners
    if (this.menuButton) {
      this.menuButton.removeEventListener('click', this.toggleMenuHandler);
    }
    
    // Remover event listener de documento
    document.removeEventListener('click', this.handleClickOutside);
    
    // Remover event listener de ventana
    window.removeEventListener('resize', this.handleResize);
    
    // Remover clase activa si está presente
    if (this.navigationMenu) {
      this.navigationMenu.classList.remove('activo');
    }
  }
}

// Inicializa la clase y la funcionalidad del menú cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
  const menu = new MenuView();
  menu.init();
});

// Exportar la clase para poder usarla en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MenuView;
}