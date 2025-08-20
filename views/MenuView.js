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
    this.menuButton.addEventListener('click', (event) => {
      event.preventDefault();
      this.toggleMenu();
    });
    
    // Evento para cerrar el menú al hacer clic en un enlace
    this.menuItems.forEach(item => {
      item.addEventListener('click', () => {
        if (this.isOpen) {
          this.closeMenu();
        }
      });
    });
    
    // Evento para cerrar el menú al hacer clic fuera de él
    document.addEventListener('click', (event) => {
      if (this.isOpen && 
          !this.navigationMenu.contains(event.target) && 
          !this.menuButton.contains(event.target)) {
        this.closeMenu();
      }
    });
    
    // Evento para manejar el redimensionamiento de la ventana
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  /**
   * Alterna la visibilidad del menú en dispositivos móviles
   */
  toggleMenu() {
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
      this.menuButton.removeEventListener('click', this.toggleMenu);
    }
    
    if (this.menuItems) {
      this.menuItems.forEach(item => {
        item.removeEventListener('click', this.closeMenu);
      });
    }
    
    // Remover clase activa si está presente
    if (this.navigationMenu) {
      this.navigationMenu.classList.remove('activo');
    }
  }
}

// Exportar la clase para poder usarla en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MenuView;
}