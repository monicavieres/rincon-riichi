document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    const petals = document.querySelectorAll('.floating-petal');

    cards.forEach((card, index) => {
        const inner = card.querySelector('.card-inner');
        const arrow = card.querySelector('.card-arrow');
        const icon = card.querySelector('.card-icon');

        card.addEventListener('mouseenter', () => {
            inner.style.transform = 'translateY(-8px)';
            arrow.style.transform = 'translateX(6px) scale(1.05)';
            icon.style.transform = 'scale(1.1)';
        });

        card.addEventListener('mouseleave', () => {
            inner.style.transform = '';
            arrow.style.transform = '';
            icon.style.transform = '';
        });

        card.addEventListener('mousemove', (e) => {
            const rect = inner.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            inner.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('click', () => {
            const target = card.dataset.target;
            handleCardClick(target, card);
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const target = card.dataset.target;
                handleCardClick(target, card);
            }
        });

        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Ir a sección de ${card.querySelector('.card-title').textContent}`);
    });

    function handleCardClick(target, cardElement) {
        cardElement.style.transform = 'scale(0.96)';
        setTimeout(() => {
            cardElement.style.transform = '';
        }, 150);

        const messages = {
            fichas: '🀄 Sección de Fichas - Próximamente disponible',
            yakus: '🏆 Sección de Yakus - Próximamente disponible',
            puntaje: '🧮 Sección de Puntaje - Próximamente disponible'
        };

        showToast(messages[target] || 'Sección en desarrollo');
    }

    function showToast(message) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: linear-gradient(135deg, var(--pink-700), var(--pink-800));
            color: var(--white);
            padding: 1rem 2rem;
            border-radius: 50px;
            box-shadow: 0 12px 32px var(--shadow-medium);
            z-index: 1000;
            font-weight: 500;
            font-size: 0.95rem;
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            border: 1px solid var(--gold-400);
        `;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    const hero = document.querySelector('.hero');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const direction = currentScrollY > lastScrollY ? 'down' : 'up';

        if (currentScrollY > 100) {
            hero.style.transform = direction === 'down' ? 'translateY(-20px)' : 'translateY(0)';
            hero.style.opacity = direction === 'down' ? '0.7' : '1';
        } else {
            hero.style.transform = 'translateY(0)';
            hero.style.opacity = '1';
        }

        lastScrollY = currentScrollY;
    }, { passive: true });

    hero.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

    const titleHighlight = document.querySelector('.title-highlight');
    if (titleHighlight) {
        titleHighlight.addEventListener('mouseenter', () => {
            titleHighlight.style.background = 'linear-gradient(135deg, var(--gold-500), var(--gold-600), var(--pink-500))';
            titleHighlight.style['-webkit-background-clip'] = 'text';
        });

        titleHighlight.addEventListener('mouseleave', () => {
            titleHighlight.style.background = 'linear-gradient(135deg, var(--pink-600), var(--pink-700), var(--gold-600))';
            titleHighlight.style['-webkit-background-clip'] = 'text';
        });
    }

    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 8px;
            height: 8px;
            background: var(--gold-400);
            border-radius: 50%;
            pointer-events: none;
            z-index: 999;
            opacity: 1;
            transform: translate(-50%, -50%) scale(0);
            animation: sparkleAnim 0.6s ease-out forwards;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes sparkleAnim {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
                100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            }
        `;
        if (!document.querySelector('#sparkle-style')) {
            style.id = 'sparkle-style';
            document.head.appendChild(style);
        }

        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 600);
    }

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const rect = card.getBoundingClientRect();
                    createSparkle(
                        rect.left + Math.random() * rect.width,
                        rect.top + Math.random() * rect.height
                    );
                }, i * 50);
            }
        });
    });

    let konamiCode = '';
    const konamiSequence = 'arrowuparrowuparrowdownarrowdownarrowleftarrowrightarrowleftrightba';

    document.addEventListener('keydown', (e) => {
        konamiCode += e.key.toLowerCase().replace(' ', '');
        if (konamiCode.length > konamiSequence.length) {
            konamiCode = konamiCode.slice(-konamiSequence.length);
        }
        if (konamiCode === konamiSequence) {
            triggerCelebration();
            konamiCode = '';
        }
    });

    function triggerCelebration() {
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                createSparkle(
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight
                );
            }, i * 50);
        }

        showToast('🎉 ¡Modo desarrollador activado! Konami code detectado');
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    }
});