/**
 * Blog JavaScript - Funcionalidades interactivas para el blog
 */

class Blog {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.currentPage = 1;
        this.articlesPerPage = 6;
        this.currentCategory = 'all';
        this.searchTerm = '';
        
        this.init();
    }

    /**
     * Inicializa el blog
     */
    init() {
        this.loadArticles();
        this.setupEventListeners();
        this.setupAnimations();
        this.setupSearch();
        this.setupFilters();
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Búsqueda
        const searchForm = document.querySelector('.formulario-busqueda');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => this.handleSearch(e));
        }

        // Filtros de categorías
        const categoryLinks = document.querySelectorAll('.widget-categorias a');
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleCategoryFilter(e));
        });

        // Paginación
        const paginationLinks = document.querySelectorAll('.paginacion .pagina');
        paginationLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handlePagination(e));
        });

        // Suscripción
        const subscriptionForm = document.querySelector('.formulario-suscripcion');
        if (subscriptionForm) {
            subscriptionForm.addEventListener('submit', (e) => this.handleSubscription(e));
        }

        // Enlaces de artículos
        const articleLinks = document.querySelectorAll('.enlace-articulo, .articulo-destacado .boton-secundario');
        articleLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleArticleClick(e));
        });

        // Scroll para animaciones
        window.addEventListener('scroll', () => this.handleScroll());
    }

    /**
     * Carga los artículos desde el archivo JSON
     */
    async loadArticles() {
        try {
            const response = await fetch('data/blog-articles.json');
            if (response.ok) {
                this.articles = await response.json();
                this.filteredArticles = [...this.articles];
                this.renderArticles();
                this.updatePagination();
            } else {
                console.error('Error cargando artículos del blog');
                this.showError('Error al cargar los artículos');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError('Error de conexión');
        }
    }

    /**
     * Renderiza los artículos
     */
    renderArticles() {
        const startIndex = (this.currentPage - 1) * this.articlesPerPage;
        const endIndex = startIndex + this.articlesPerPage;
        const articlesToShow = this.filteredArticles.slice(startIndex, endIndex);

        const gridContainer = document.querySelector('.grid-articulos');
        if (!gridContainer) return;

        if (articlesToShow.length === 0) {
            gridContainer.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--color-texto-claro); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--color-texto-claro); margin-bottom: 0.5rem;">No se encontraron artículos</h3>
                    <p style="color: var(--color-texto-claro);">Intenta con otros términos de búsqueda o categorías</p>
                </div>
            `;
            return;
        }

        gridContainer.innerHTML = articlesToShow.map(article => this.createArticleHTML(article)).join('');
    }

     createArticleHTML(article) {
        const date = new Date(article.date);
        const formattedDate = this.formatDate(date);
        

        return `
            <article class="articulo" data-id="${article.id}" data-category="${article.category.toLowerCase()}">
                <div class="imagen-articulo">
                    <img src="${img.image}" alt="${article.title}">
                </div>
                <div class="contenido-articulo">
                    <div class="meta-articulo">
                        <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                        <span><i class="fas fa-folder"></i> ${article.category}</span>
                    </div>
                    <h3>${article.title}</h3>
                    <p>${article.excerpt}</p>
                    <a href="blog-detalle.html?id=${article.id}" class="enlace-articulo">
                        Leer más <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </article>
        `;
    }

    /**
     * Maneja la búsqueda
     */
    handleSearch(e) {
        e.preventDefault();
        const searchInput = e.target.querySelector('input');
        this.searchTerm = searchInput.value.toLowerCase().trim();
        this.filterArticles();
    }

    /**
     * Maneja el filtro por categoría
     */
    handleCategoryFilter(e) {
        e.preventDefault();
        const category = e.target.getAttribute('data-category') || 'all';
        this.currentCategory = category;
        
        // Actualizar estado activo
        document.querySelectorAll('.widget-categorias a').forEach(link => {
            link.classList.remove('active');
        });
        e.target.classList.add('active');
        
        this.filterArticles();
    }

    /**
     * Filtra los artículos
     */
    filterArticles() {
        this.filteredArticles = this.articles.filter(article => {
            const matchesSearch = this.searchTerm === '' || 
                article.title.toLowerCase().includes(this.searchTerm) ||
                article.excerpt.toLowerCase().includes(this.searchTerm) ||
                article.content.toLowerCase().includes(this.searchTerm);
            
            const matchesCategory = this.currentCategory === 'all' || 
                article.category.toLowerCase() === this.currentCategory;
            
            return matchesSearch && matchesCategory;
        });

        this.currentPage = 1;
        this.renderArticles();
        this.updatePagination();
        this.updateResultsCount();
    }

    /**
     * Actualiza la paginación
     */
    updatePagination() {
        const totalPages = Math.ceil(this.filteredArticles.length / this.articlesPerPage);
        const paginationContainer = document.querySelector('.paginacion');
        
        if (!paginationContainer) return;

        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';
        
        let paginationHTML = '';
        
        // Botón anterior
        if (this.currentPage > 1) {
            paginationHTML += `
                <a href="#" class="pagina anterior" data-page="${this.currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </a>
            `;
        }

        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <a href="#" class="pagina ${i === this.currentPage ? 'activa' : ''}" data-page="${i}">
                        ${i}
                    </a>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += '<span class="pagina-ellipsis">...</span>';
            }
        }

        // Botón siguiente
        if (this.currentPage < totalPages) {
            paginationHTML += `
                <a href="#" class="pagina siguiente" data-page="${this.currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </a>
            `;
        }

        paginationContainer.innerHTML = paginationHTML;
        
        // Agregar event listeners a los nuevos botones
        paginationContainer.querySelectorAll('.pagina').forEach(link => {
            link.addEventListener('click', (e) => this.handlePagination(e));
        });
    }

    /**
     * Maneja la paginación
     */
    handlePagination(e) {
        e.preventDefault();
        const page = parseInt(e.target.getAttribute('data-page'));
        if (page && page !== this.currentPage) {
            this.currentPage = page;
            this.renderArticles();
            this.updatePagination();
            this.scrollToTop();
        }
    }

    /**
     * Actualiza el contador de resultados
     */
    updateResultsCount() {
        const resultsCount = document.querySelector('.results-count');
        if (resultsCount) {
            resultsCount.textContent = `${this.filteredArticles.length} artículos encontrados`;
        }
    }

    /**
     * Maneja la suscripción
     */
    handleSubscription(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        
        if (this.validateEmail(email)) {
            this.showSuccess('¡Gracias por suscribirte! Te enviaremos nuestros mejores artículos.');
            e.target.reset();
        } else {
            this.showError('Por favor, ingresa un email válido.');
        }
    }

    /**
     * Maneja el clic en artículos
     */
    handleArticleClick(e) {
        // Agregar efecto de clic
        const article = e.target.closest('.articulo, .articulo-destacado');
        if (article) {
            article.style.transform = 'scale(0.98)';
            setTimeout(() => {
                article.style.transform = '';
            }, 150);
        }
    }

    /**
     * Configura las animaciones
     */
    setupAnimations() {
        // Animación de entrada para artículos
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observar artículos
        document.querySelectorAll('.articulo, .widget').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    /**
     * Configura la búsqueda
     */
    setupSearch() {
        const searchInput = document.querySelector('.formulario-busqueda input');
        if (searchInput) {
            let searchTimeout;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchTerm = e.target.value.toLowerCase().trim();
                    this.filterArticles();
                }, 300);
            });
        }
    }


    /**
     * Configura los filtros
     */
    setupFilters() {
        // Agregar data-category a los enlaces de categorías
        document.querySelectorAll('.widget-categorias a').forEach(link => {
            const text = link.textContent.toLowerCase();
            const category = text.replace(/\s*\(\d+\)/, '').trim();
            link.setAttribute('data-category', category);
        });
    }

    /**
     * Maneja el scroll
     */
    handleScroll() {
        // Efecto parallax en el banner
        const banner = document.querySelector('.banner-pagina');
        if (banner) {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            banner.style.transform = `translateY(${rate}px)`;
        }

        // Mostrar/ocultar botón de volver arriba
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const backToTop = document.querySelector('.back-to-top');
        
        if (scrollTop > 300) {
            if (!backToTop) {
                this.createBackToTopButton();
            }
        } else if (backToTop) {
            backToTop.remove();
        }
    }

    /**
     * Crea el botón de volver arriba
     */
    createBackToTopButton() {
        const button = document.createElement('button');
        button.className = 'back-to-top';
        button.innerHTML = '<i class="fas fa-chevron-up"></i>';
        button.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--color-primario);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            z-index: 1000;
            opacity: 0;
            transform: translateY(20px);
        `;

        button.addEventListener('click', () => this.scrollToTop());
        document.body.appendChild(button);

        // Animación de entrada
        setTimeout(() => {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, 100);
    }

    /**
     * Hace scroll hacia arriba
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Formatea una fecha
     */
    formatDate(date) {
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    /**
     * Valida un email
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Muestra un mensaje de éxito
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Muestra un mensaje de error
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Muestra una notificación
     */
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            ${type === 'success' ? 'background: #4caf50;' : 'background: #f44336;'}
        `;

        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
}

// Inicializar el blog cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Blog();
});
