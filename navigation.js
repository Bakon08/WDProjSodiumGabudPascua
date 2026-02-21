/**
 * RESPONSIVE NAVIGATION SYSTEM
 * Manages desktop sidebar and mobile bottom navigation
 * Handles active states, tab switching, and responsive behavior
 */

// Navigation configuration with routes and icons
const navConfig = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        href: 'dashboard.html',
        iconClass: 'fas fa-home',
        mobileLabel: 'Home'
    },
    {
        id: 'planner',
        label: 'Planner',
        href: 'Public/Planner.html',
        iconClass: 'fas fa-calendar-alt',
        mobileLabel: 'Tasks'
    },
    {
        id: 'goals',
        label: 'Goals',
        href: 'Public/Goals.html',
        iconClass: 'fas fa-star',
        mobileLabel: 'Goals'
    },
    {
        id: 'notes',
        label: 'Notes',
        href: 'Public/Notes.html',
        iconClass: 'fas fa-sticky-note',
        mobileLabel: 'Notes'
    },
    {
        id: 'stats',
        label: 'Stats',
        href: 'Public/Stats.html',
        iconClass: 'fas fa-chart-bar',
        mobileLabel: 'Stats'
    }
];

/**
 * Navigation Manager Class
 * Handles all navigation logic and state management
 */
class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.activeNavItem = null;
        this.init();
    }

    /**
     * Initialize navigation system
     * Set up event listeners and initial state
     */
    init() {
        // Set active navigation item on page load
        this.setActiveNavItem();
        
        // Set up click handlers for all navigation items
        this.setupNavigationHandlers();
        
        // Handle window resize for responsive behavior
        window.addEventListener('resize', () => {
            this.handleResponsiveChange();
        });
        
        // Handle mobile navigation
        this.setupMobileNavigation();
    }

    /**
     * Get current page from URL
     * @returns {string} Current page identifier
     */
    getCurrentPage() {
        const currentUrl = window.location.pathname;
        
        // Match the current URL to a nav config item
        for (let config of navConfig) {
            if (currentUrl.includes(config.href)) {
                return config.id;
            }
        }
        
        // Default to dashboard if no match
        return 'dashboard';
    }

    /**
     * Set the active navigation item based on current page
     */
    setActiveNavItem() {
        // Remove active class from all nav items
        const allNavItems = document.querySelectorAll('.nav-item, .bottom-nav-item');
        allNavItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current page's nav item
        const activeItems = document.querySelectorAll(`[href*="${navConfig.find(c => c.id === this.currentPage).href}"]`);
        activeItems.forEach(item => {
            if (item.classList.contains('nav-item') || item.classList.contains('bottom-nav-item')) {
                item.classList.add('active');
                this.activeNavItem = item;
            }
        });
    }

    /**
     * Set up click handlers for navigation items
     * Works for both sidebar and bottom nav
     */
    setupNavigationHandlers() {
        const allNavItems = document.querySelectorAll('.nav-item, .bottom-nav-item');
        
        allNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Get the href from the link
                const href = item.getAttribute('href');
                
                if (href) {
                    // Update active state
                    this.updateActiveState(item, href);
                    
                    // Navigate to the new page
                    // (Default behavior will trigger, but we can add custom logic here)
                }
            });
        });
    }

    /**
     * Update active state when navigation item is clicked
     * @param {Element} clickedItem - The clicked navigation item
     * @param {string} href - The href of the clicked item
     */
    updateActiveState(clickedItem, href) {
        // Remove active class from all items
        const allNavItems = document.querySelectorAll('.nav-item, .bottom-nav-item');
        allNavItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked item and all items with same href
        clickedItem.classList.add('active');
        const sameHrefItems = document.querySelectorAll(`[href="${href}"]`);
        sameHrefItems.forEach(item => {
            item.classList.add('active');
        });
        
        this.activeNavItem = clickedItem;
    }

    /**
     * Set up mobile navigation specific features
     */
    setupMobileNavigation() {
        const bottomNav = document.querySelector('.bottom-nav');
        
        if (bottomNav) {
            // Add touch feedback
            const bottomNavItems = bottomNav.querySelectorAll('.bottom-nav-item');
            
            bottomNavItems.forEach(item => {
                item.addEventListener('touchstart', () => {
                    item.style.opacity = '0.7';
                });
                
                item.addEventListener('touchend', () => {
                    item.style.opacity = '1';
                });
            });
        }
    }

    /**
     * Handle responsive changes when window is resized
     */
    handleResponsiveChange() {
        const isMobile = window.innerWidth <= 768;
        const sidebar = document.querySelector('.sidebar');
        const bottomNav = document.querySelector('.bottom-nav');
        
        if (sidebar && bottomNav) {
            if (isMobile) {
                sidebar.style.display = 'none';
                bottomNav.style.display = 'flex';
            } else {
                sidebar.style.display = 'flex';
                bottomNav.style.display = 'none';
            }
        }
    }

    /**
     * Highlight active navigation item
     * Called when page changes or navigation occurs
     * @param {string} pageId - The page identifier to highlight
     */
    highlightPage(pageId) {
        const pageConfig = navConfig.find(c => c.id === pageId);
        
        if (pageConfig) {
            // Find all elements linking to this page
            const navItems = document.querySelectorAll(`[href*="${pageConfig.href}"]`);
            
            navItems.forEach(item => {
                if (item.classList.contains('nav-item') || item.classList.contains('bottom-nav-item')) {
                    this.updateActiveState(item, pageConfig.href);
                }
            });
        }
    }

    /**
     * Safe area handling for mobile
     * Adds bottom padding to main content when on mobile
     */
    adjustSafeArea() {
        const isMobile = window.innerWidth <= 768;
        const mainContent = document.querySelector('.main-content, .main-content-wrapper');
        
        if (mainContent && isMobile) {
            // Add padding if not already set
            if (!mainContent.style.paddingBottom || mainContent.style.paddingBottom === '0px') {
                mainContent.style.paddingBottom = '100px';
            }
        }
    }
}

/**
 * Initialize navigation manager when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    const navManager = new NavigationManager();
    
    // Adjust safe area for mobile
    navManager.adjustSafeArea();
    
    // Re-adjust on resize
    window.addEventListener('resize', () => {
        navManager.adjustSafeArea();
    });
    
    // Handle initial responsive state
    navManager.handleResponsiveChange();
    
    // Make navigation manager globally accessible if needed
    window.navigationManager = navManager;
});

/**
 * Helper function to navigate to a page
 * @param {string} href - The href to navigate to
 */
function navigateTo(href) {
    window.location.href = href;
}

/**
 * Helper function to get current page
 * @returns {string} Current page identifier
 */
function getCurrentPage() {
    return window.navigationManager?.currentPage || 'dashboard';
}
