# Clase MenuView

La clase `MenuView` maneja la funcionalidad del menú de navegación del sitio web, incluyendo la apertura y cierre del menú en dispositivos móviles.

## Propiedades

- `menuButton`: Elemento del botón de menú
- `navigationMenu`: Elemento del menú de navegación
- `menuItems`: Elementos de los ítems del menú

## Métodos

- `constructor()`: Inicializa la funcionalidad del menú
- `init()`: Inicializa los event listeners para el menú
- `toggleMenu()`: Alterna la visibilidad del menú en dispositivos móviles
- `closeMenu()`: Cierra el menú
- `openMenu()`: Abre el menú
- `setActiveLink()`: Establece el enlace activo en la navegación
- `handleResize()`: Maneja el redimensionamiento de la ventana

## Ejemplo de Uso

```javascript
const menuView = new MenuView();
menuView.init(); // Inicializa la funcionalidad del menú
```

## Características

- Responsive: Se adapta a diferentes tamaños de pantalla
- Animaciones suaves para la apertura/cierre del menú
- Manejo de estado activo para la navegación actual
- Accesibilidad mejorada con atributos ARIA