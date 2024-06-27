let lastScrollTop = 0;
const navbar = document.querySelector('.navbar-custom');
const navbarCollapse = document.querySelector('.navbar-collapse');

// Function to check if an element is a descendant of another element
const isDescendant = (parent, child) => {
    let node = child.parentNode;
    while (node != null) {
        if (node === parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
};

// Event listener for clicks on the document
document.addEventListener('click', (event) => {
    const target = event.target;

    // Check if the clicked element is not within the navbar and navbarCollapse is open
    if (!isDescendant(navbar, target) && !navbar.contains(target) && navbarCollapse.classList.contains('show')) {
        navbarCollapse.classList.remove('show');
    }
});

// Event listener for scrolling
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        // Scrolling down
        navbar.style.top = '-60px';
        if (navbarCollapse.classList.contains('show')) {
            // Collapse the navbar
            navbarCollapse.classList.remove('show');
        }
    } else {
        // Scrolling up
        navbar.style.top = '0';
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});
