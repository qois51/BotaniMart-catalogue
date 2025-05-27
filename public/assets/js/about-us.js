document.addEventListener('DOMContentLoaded', function() {
    // Animasi saat scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-slide').forEach(element => {
        observer.observe(element);
    });

    // Smooth scroll untuk navigasi
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Tombol Catalog
    document.getElementById('catalogBtn').addEventListener('click', function() {
        window.location.href = 'catalog';
    });
});