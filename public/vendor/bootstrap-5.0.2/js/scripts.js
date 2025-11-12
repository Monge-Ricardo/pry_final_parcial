/**
 * scripts.js - Galería de Arte Digital
 * JavaScript principal para funcionalidades globales
 */

// Configuración global
const CONFIG = {
    apiBaseUrl: 'https://jsonplaceholder.typicode.com',
    animationDuration: 300,
    toastDuration: 5000
};

// Función para cargar páginas dinámicamente usando Fetch API
function loadPage(event, url) {
    event.preventDefault();
    
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
        console.error('Elemento main-content no encontrado');
        return;
    }
    
    // Mostrar indicador de carga
    mainContent.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3 text-muted">Cargando contenido...</p>
        </div>
    `;
    
    // Fetch API para cargar la página
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            // Animación de entrada
            mainContent.style.opacity = '0';
            
            setTimeout(() => {
                mainContent.innerHTML = html;
                mainContent.style.opacity = '1';
                
                // Scroll suave al inicio
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                
                // Ejecutar scripts de la página cargada
                executePageScripts(mainContent);
                
                // Actualizar navegación activa
                updateActiveNav(url);
            }, CONFIG.animationDuration);
        })
        .catch(error => {
            console.error('Error al cargar la página:', error);
            mainContent.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">
                        <i class="fas fa-exclamation-triangle"></i> Error al Cargar
                    </h4>
                    <p>No se pudo cargar la página solicitada.</p>
                    <hr>
                    <p class="mb-0">
                        <strong>Detalles:</strong> ${error.message}
                    </p>
                    <button class="btn btn-outline-danger mt-3" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Recargar Página
                    </button>
                </div>
            `;
        });
}

// Ejecutar scripts dentro de contenido cargado dinámicamente
function executePageScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        
        // Copiar atributos
        Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copiar contenido
        newScript.textContent = oldScript.textContent;
        
        // Reemplazar script
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

// Actualizar enlace activo en navegación
function updateActiveNav(url) {
    // Remover clase active de todos los enlaces
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Agregar clase active al enlace correspondiente
    const activeLink = document.querySelector(`.nav-link[href="${url}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Sistema de notificaciones Toast
function showToast(message, type = 'info') {
    const toastContainer = getOrCreateToastContainer();
    
    const toastId = 'toast-' + Date.now();
    const iconMap = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    const bgMap = {
        'success': 'bg-success',
        'error': 'bg-danger',
        'warning': 'bg-warning',
        'info': 'bg-info'
    };
    
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgMap[type]} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas ${iconMap[type]} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: CONFIG.toastDuration
    });
    
    toast.show();
    
    // Remover elemento del DOM después de ocultarse
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

// Crear o obtener contenedor de toasts
function getOrCreateToastContainer() {
    let container = document.getElementById('toast-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'position-fixed top-0 end-0 p-3';
        container.style.zIndex = '11';
        document.body.appendChild(container);
    }
    
    return container;
}

// Cargar datos desde API externa
async function fetchExternalData(endpoint) {
    try {
        const response = await fetch(`${CONFIG.apiBaseUrl}/${endpoint}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return { success: true, data };
        
    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, error: error.message };
    }
}

// Animaciones de scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar elementos con clase .animate-on-scroll
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Smooth scroll para enlaces ancla
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Ignorar si es solo "#"
            if (href === '#') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Botón "Volver arriba"
function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = 'btn btn-primary btn-back-to-top';
    backToTopBtn.title = 'Volver arriba';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: none;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(backToTopBtn);
    
    // Mostrar/ocultar botón según scroll
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    // Funcionalidad del botón
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Lazy loading de imágenes
function initLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Validación de formularios en tiempo real
function initFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
        
        // Validación en tiempo real
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.checkValidity()) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                }
            });
        });
    });
}

// Protección contra spam en formularios
function initSpamProtection() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Agregar campo honeypot (invisible)
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.style.display = 'none';
        honeypot.tabIndex = -1;
        honeypot.autocomplete = 'off';
        form.appendChild(honeypot);
        
        // Verificar en submit
        form.addEventListener('submit', function(e) {
            if (honeypot.value !== '') {
                e.preventDefault();
                console.warn('Posible spam detectado');
                showToast('Error al enviar el formulario', 'error');
                return false;
            }
        });
    });
}

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
});

// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 Galería de Arte Digital - Sistema iniciado');
    
    // Cargar página inicial
    loadPage(new Event('load'), './views/home.html');
    
    // Inicializar funcionalidades
    initSmoothScroll();
    initBackToTop();
    initLazyLoading();
    initFormValidation();
    initSpamProtection();
    
    // Mensaje de bienvenida
    setTimeout(() => {
        showToast('¡Bienvenido a la Galería de Arte Digital!', 'success');
    }, 1000);
});

// Event listeners para navegación
document.addEventListener('click', function(e) {
    // Actualizar clase active en navegación
    if (e.target.matches('.nav-link')) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        e.target.classList.add('active');
    }
});

// Prevenir comportamiento por defecto de enlaces # vacíos
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href="#"]') || e.target.matches('a[href="#!"]')) {
        e.preventDefault();
    }
});

// Cerrar navbar al hacer clic en un enlace (móvil)
document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', function() {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            const bsCollapse = new bootstrap.Collapse(navbarCollapse);
            bsCollapse.hide();
        }
    });
});

// Exportar funciones para uso global
window.galeria = {
    loadPage,
    showToast,
    fetchExternalData
};