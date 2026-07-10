/* ========================================================
   NOTION APPS & UX CONTROLLER - JAVASCRIPT
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. THEME SYNCRONIZER (Light & Dark Mode)
    // ==========================================
    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    
    function applyTheme(theme) {
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-mode', isDark);
        
        themeToggleBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            }
            btn.setAttribute('aria-label', isDark ? 'Toggle light mode' : 'Toggle dark mode');
        });
        
        localStorage.setItem('theme', theme);
        
        // Redraw Rician simulator canvases if they exist
        if (window.updateRicianSim) {
            window.updateRicianSim();
        }
    }
    
    // Initial theme check
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);
    
    // Bind toggle buttons
    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
            applyTheme(currentTheme);
        });
    });

    // ==========================================
    // 2. COLLAPSIBLE SIDEBAR ENGINE
    // ==========================================
    const sidebar = document.getElementById('sidebar');
    const sidebarTriggers = document.querySelectorAll('.sidebar-trigger');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const breadcrumbs = document.getElementById('breadcrumbs');
    
    function toggleSidebar(forceState) {
        if (!sidebar) return;
        
        const isCollapsed = forceState !== undefined ? !forceState : !sidebar.classList.contains('collapsed');
        sidebar.classList.toggle('collapsed', isCollapsed);
        const usesMobileDrawer = window.innerWidth <= 900;
        const isDrawerOpen = usesMobileDrawer && !isCollapsed;
        document.body.classList.toggle('sidebar-open', isDrawerOpen);
        sidebar.setAttribute('aria-hidden', String(usesMobileDrawer && isCollapsed));
        if (sidebarBackdrop) sidebarBackdrop.classList.toggle('visible', isDrawerOpen);
        
        // Toggle visibility of hamburger triggers
        sidebarTriggers.forEach(trigger => {
            trigger.classList.toggle('visible', isCollapsed);
            trigger.setAttribute('aria-expanded', String(!isCollapsed));
        });
        
        // Toggle spacing on breadcrumbs
        if (breadcrumbs) {
            breadcrumbs.classList.toggle('wide', isCollapsed);
        }
        
        localStorage.setItem('sidebarCollapsed', isCollapsed ? 'true' : 'false');
        
        // Handle canvas resizing if sidebar changes layout size
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 300); // Wait for transition to finish
    }
    
    // Initialize Sidebar State
    const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    const isMobile = window.innerWidth <= 900;
    
    if (sidebar) {
        // Mobile starts collapsed automatically, desktop restores saved preference
        toggleSidebar(isMobile ? false : !savedSidebarCollapsed);
        
        // Bind trigger clicks
        sidebarTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => toggleSidebar(true));
        });
        
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => toggleSidebar(false));
        }

        if (sidebarBackdrop) {
            sidebarBackdrop.addEventListener('click', () => toggleSidebar(false));
        }

        sidebar.querySelectorAll('.sidebar-item').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 900) toggleSidebar(false);
            });
        });
    }
    
    // Auto collapse sidebar on resize (only if width changes to prevent mobile address bar glitches)
    let lastWidth = window.innerWidth;
    let resizeTimer;
    window.addEventListener('resize', () => {
        const currentWidth = window.innerWidth;
        if (currentWidth === lastWidth) return; // Skip height-only changes caused by mobile scrolling
        lastWidth = currentWidth;

        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const mobile = window.innerWidth <= 900;
            if (sidebar) {
                if (mobile && !sidebar.classList.contains('collapsed')) {
                    toggleSidebar(false);
                } else if (!mobile) {
                    document.body.classList.remove('sidebar-open');
                    if (sidebarBackdrop) sidebarBackdrop.classList.remove('visible');
                    sidebar.removeAttribute('aria-hidden');
                }
            }
        }, 100);
    });

    // ==========================================
    // 3. INTERSECTION OBSERVER (Scroll Reveals)
    // ==========================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ==========================================
    // 4. SCROLL PROGRESS & FLOATING ACTIONS
    // ==========================================
    const scrollProgress = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');
    
    // Unified scroll listener
    const sections = document.querySelectorAll('section[id]');
    const sidebarItems = document.querySelectorAll('#sidebarLinks .sidebar-item[data-section]');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Update Scroll Progress bar
        if (scrollProgress && docHeight > 0) {
            scrollProgress.style.width = (scrollTop / docHeight * 100) + '%';
        }
        
        // Back To Top button visibility
        if (backToTop) {
            backToTop.classList.toggle('visible', scrollTop > 400);
        }
        
        // Sidebar active link highlighting
        let currentSection = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            if (scrollTop >= top) {
                currentSection = sec.id;
            }
        });
        
        sidebarItems.forEach(item => {
            const targetSection = item.getAttribute('data-section');
            item.classList.toggle('active', targetSection === currentSection);
        });
    }, { passive: true });

    // Scroll to Top trigger click
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==========================================
    // 5. LIVE TIME CLOCK (Guwahati Local Time)
    // ==========================================
    const liveTimeEl = document.getElementById('liveTime');
    if (liveTimeEl) {
        function updateClock() {
            liveTimeEl.textContent = new Date().toLocaleTimeString('en-US', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
            });
        }
        updateClock();
        setInterval(updateClock, 1000);
    }
    
    // Auto-update footer copyright year
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    // ==========================================
    // 6. DYNAMIC PUBLICATION FILTERING & SORTING
    // ==========================================
    const pubList = document.querySelector('.pub-list');
    const pubItems = document.querySelectorAll('.pub-item');
    const pubTabs = document.querySelectorAll('.pub-tab');
    
    // Filter click bindings
    pubTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            pubTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const filter = tab.dataset.filter;
            pubItems.forEach(item => {
                const showItem = filter === 'all' || item.dataset.type === filter;
                item.style.display = showItem ? 'flex' : 'none';
                if (showItem) {
                    item.classList.add('visible');
                }
            });
        });
    });
    
    // Sort Publications Descending (Newest first)
    if (pubList && pubItems.length > 0) {
        const sortedItems = Array.from(pubItems).sort((a, b) => {
            const dateA = a.getAttribute('data-date') || '0000-00';
            const dateB = b.getAttribute('data-date') || '0000-00';
            return dateB.localeCompare(dateA); // Lexicographical comparison for YYYY-MM
        });
        
        pubList.innerHTML = '';
        sortedItems.forEach(item => pubList.appendChild(item));
    }

    // ==========================================
    // 7. BIBTEX CITATION COPY CONTROLLER
    // ==========================================
    window.copyBib = function(id) {
        const el = document.getElementById(id);
        if (!el) return;
        const text = el.innerText.replace(/Copy/i, '').trim();
        navigator.clipboard.writeText(text).then(() => {
            const btn = el.querySelector('.copy-bib-btn');
            if (btn) {
                const origText = btn.innerText;
                btn.innerText = 'Copied!';
                setTimeout(() => btn.innerText = origText, 1500);
            }
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    };

    // ==========================================
    // 8. CONTACT FORM SUBMISSION Fallback
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const subject = document.getElementById('contact-subject').value;
            const message = document.getElementById('contact-message').value;
            
            const mailtoUri = `mailto:h.raj@iitg.ac.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`)}`;
            window.location.href = mailtoUri;
        });
    }

    // ==========================================
    // 9. RETRO SPACE CANVAS ENGINE (Pixel Art Doodles & Stars)
    // ==========================================
    const coverCanvas = document.querySelector('.cover-canvas');
    if (coverCanvas) {
        const ctx = coverCanvas.getContext('2d');
        let width = 0;
        let height = 0;
        let groundY = 0;
        let time = 0;
        let obstacles = [];
        let stars = [];
        let backgroundDoodles = [];
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Companion Paper Plane definition
        const companionPlane = {
            x: 165, // Positioned dynamically in resize()
            y: 0,
            vy: 0,
            isJumping: false,
            isDucking: false,
            duckTimer: 0,
            update() {
                if (astronaut.isFloating) {
                    // Hover along with the floating astronaut
                    const targetY = astronaut.y - 12;
                    this.y += (targetY - this.y) * 0.1;
                    this.isJumping = false;
                    this.isDucking = false;
                } else {
                    // Jump mechanics
                    if (this.isJumping) {
                        this.y += this.vy;
                        this.vy += 0.55;
                        if (this.y >= 0) {
                            this.y = 0;
                            this.isJumping = false;
                            this.vy = 0;
                        }
                    } else {
                        if (this.y < 0) {
                            this.y += this.vy;
                            this.vy += 0.55;
                            if (this.y >= 0) {
                                this.y = 0;
                                this.vy = 0;
                            }
                        }
                    }
                    // Duck mechanics
                    if (this.duckTimer > 0) {
                        this.duckTimer--;
                        this.isDucking = true;
                    } else {
                        this.isDucking = false;
                    }
                }
            }
        };

        // Autopilot Astronaut definition
        const astronaut = {
            x: 420,
            y: 0, // offset from ground
            vy: 0,
            width: 20,
            height: 30,
            isJumping: false,
            isDucking: false,
            isFloating: false,
            floatTimer: 0,
            duckTimer: 0,
            runCycle: 0,
            update() {
                this.runCycle++;
                
                // Randomly trigger floating/flying mode sometimes
                if (Math.random() < 0.0025 && !this.isJumping && !this.isDucking && !this.isFloating && this.y === 0) {
                    this.isFloating = true;
                    this.floatTimer = 150 + Math.random() * 120; // Float for 2.5 - 4.5 seconds
                }

                if (this.isFloating) {
                    this.floatTimer--;
                    
                    // Auto-adjust flight altitude if a high obstacle is coming
                    let nextHighObs = null;
                    let minDist = Infinity;
                    obstacles.forEach(obs => {
                        const dist = obs.x - this.x;
                        if (obs.isHigh && dist > -15 && dist < minDist) {
                            minDist = dist;
                            nextHighObs = obs;
                        }
                    });
                    
                    // If high obstacle is close, float higher to clear it, else hover normally
                    let targetY = -35 + Math.sin(this.runCycle * 0.12) * 5;
                    if (nextHighObs && minDist < 120) {
                        targetY = -70; // Fly high!
                    }
                    
                    this.y += (targetY - this.y) * 0.08; // smooth float ease
                    
                    if (this.floatTimer <= 0) {
                        this.isFloating = false;
                        this.vy = 0;
                    }
                } else {
                    // Jump mechanics
                    if (this.isJumping) {
                        this.y += this.vy;
                        this.vy += 0.55; // gravity
                        if (this.y >= 0) {
                            this.y = 0;
                            this.isJumping = false;
                            this.vy = 0;
                        }
                    } else {
                        // Gently fall down if not floating/jumping
                        if (this.y < 0) {
                            this.y += this.vy;
                            this.vy += 0.55;
                            if (this.y >= 0) {
                                this.y = 0;
                                this.vy = 0;
                            }
                        }
                    }
                    
                    // Duck mechanics
                    if (this.duckTimer > 0) {
                        this.duckTimer--;
                        this.isDucking = true;
                    } else {
                        this.isDucking = false;
                    }
                }
            },
            draw(isDark) {
                const pxY = groundY + this.y;
                const lineColor = isDark ? '#ffffff' : '#0f172a';
                const fillColor = isDark ? '#0f172a' : '#ffffff';
                
                ctx.save();
                // Draw the little explorer at a deliberately oversized, readable scale.
                ctx.translate(this.x, pxY);
                ctx.scale(1.6, 1.6);
                ctx.translate(-this.x, -pxY);
                ctx.strokeStyle = lineColor;
                ctx.fillStyle = fillColor;
                ctx.lineWidth = 1.5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                if (this.isDucking) {
                    // Squished suit for ducking
                    ctx.beginPath();
                    ctx.fillRect(this.x - 7, pxY - 8, 14, 8);
                    ctx.rect(this.x - 7, pxY - 8, 14, 8);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.fillRect(this.x - 11, pxY - 8, 4, 7);
                    ctx.rect(this.x - 11, pxY - 8, 4, 7);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.arc(this.x + 1, pxY - 14, 7, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.fillStyle = lineColor;
                    ctx.ellipse(this.x + 4, pxY - 14, 3.5, 2, 0, -Math.PI / 2, Math.PI / 2);
                    ctx.fill();
                    
                    ctx.strokeStyle = lineColor;
                    ctx.beginPath();
                    ctx.moveTo(this.x - 4, pxY); ctx.lineTo(this.x - 7, pxY - 2);
                    ctx.moveTo(this.x + 3, pxY); ctx.lineTo(this.x + 1, pxY - 2);
                    ctx.stroke();
                } else if (this.isFloating) {
                    // Flying/Floating Posture
                    // Suit
                    ctx.beginPath();
                    ctx.fillRect(this.x - 6, pxY - 16, 12, 16);
                    ctx.rect(this.x - 6, pxY - 16, 12, 16);
                    ctx.stroke();
                    
                    // Backpack/Jetpack
                    ctx.beginPath();
                    ctx.fillRect(this.x - 10, pxY - 15, 4, 13);
                    ctx.rect(this.x - 10, pxY - 15, 4, 13);
                    ctx.stroke();
                    
                    // Jetpack exhaust trails (under backpack at x - 8)
                    ctx.save();
                    ctx.strokeStyle = lineColor;
                    ctx.setLineDash([2, 3]);
                    ctx.lineWidth = 1;
                    const exhaustOffset = (this.runCycle * 0.4) % 6;
                    ctx.beginPath();
                    ctx.moveTo(this.x - 8, pxY);
                    ctx.lineTo(this.x - 11, pxY + 7 + exhaustOffset);
                    ctx.moveTo(this.x - 9, pxY);
                    ctx.lineTo(this.x - 7, pxY + 5 + (exhaustOffset * 0.7));
                    ctx.stroke();
                    ctx.restore();
                    
                    // Helmet
                    ctx.beginPath();
                    ctx.arc(this.x + 1, pxY - 23, 9, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    
                    // Visor
                    ctx.beginPath();
                    ctx.fillStyle = lineColor;
                    ctx.ellipse(this.x + 5, pxY - 23, 4.5, 2.5, 0, -Math.PI / 2, Math.PI / 2);
                    ctx.fill();
                    
                    // Legs angled backwards slightly
                    ctx.strokeStyle = lineColor;
                    ctx.beginPath();
                    ctx.moveTo(this.x - 3, pxY);
                    ctx.lineTo(this.x - 6, pxY + 4);
                    ctx.moveTo(this.x + 3, pxY);
                    ctx.lineTo(this.x - 1, pxY + 4);
                    ctx.stroke();
                } else {
                    // Normal run/jump cycle
                    ctx.beginPath();
                    ctx.fillRect(this.x - 6, pxY - 16, 12, 16);
                    ctx.rect(this.x - 6, pxY - 16, 12, 16);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.fillRect(this.x - 10, pxY - 15, 4, 13);
                    ctx.rect(this.x - 10, pxY - 15, 4, 13);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.arc(this.x + 1, pxY - 23, 9, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.fillStyle = lineColor;
                    ctx.ellipse(this.x + 5, pxY - 23, 4.5, 2.5, 0, -Math.PI / 2, Math.PI / 2);
                    ctx.fill();
                    
                    ctx.strokeStyle = lineColor;
                    if (this.isJumping) {
                        ctx.beginPath();
                        ctx.moveTo(this.x - 3, pxY);
                        ctx.lineTo(this.x - 3, pxY + 5);
                        ctx.moveTo(this.x + 3, pxY);
                        ctx.lineTo(this.x + 3, pxY + 5);
                        ctx.stroke();
                    } else {
                        const swing = Math.sin(this.runCycle * 0.3) * 5;
                        ctx.beginPath();
                        ctx.moveTo(this.x - 3, pxY);
                        ctx.lineTo(this.x - 3 + swing, pxY + 5);
                        ctx.moveTo(this.x + 3, pxY);
                        ctx.lineTo(this.x + 3 - swing, pxY + 5);
                        ctx.stroke();
                    }
                }
                ctx.restore();
            }
        };

        class Star {
            constructor() {
                this.reset(true);
            }
            reset(init = false) {
                this.x = init ? Math.random() * width : width + 10;
                this.y = Math.random() * (groundY - 15);
                this.size = Math.random() * 2 + 1.5;
                this.speed = Math.random() * 0.2 + 0.1;
                this.opacity = Math.random() * 0.5 + 0.5;
            }
            update() {
                this.x -= this.speed;
                if (this.x < -10) this.reset();
            }
            draw(isDark) {
                ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${this.opacity})` : `rgba(15, 23, 42, ${this.opacity * 0.25})`;
                ctx.fillRect(Math.floor(this.x), Math.floor(this.y), Math.floor(this.size), Math.floor(this.size));
            }
        }

        class BackgroundDoodle {
            constructor() {
                this.reset(true);
            }
            reset(init = false) {
                this.x = init ? Math.random() * width : width + 100;
                this.y = Math.random() * (groundY - 60) + 15;
                this.type = Math.floor(Math.random() * 6); // planet, constellation, orbit, radar, wave, engineering sketch
                this.speed = Math.random() * 0.15 + 0.05;
                this.size = Math.random() * 15 + 10;
                this.angle = Math.random() * Math.PI;
            }
            update() {
                this.x -= this.speed;
                this.angle += 0.002;
                if (this.x < -100) this.reset();
            }
            draw(isDark) {
                const color = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.06)';
                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                
                if (this.type === 0) {
                    // Saturn Planet
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(0.3);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 16, 3, 0, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (this.type === 1) {
                    // Constellation (connected triangles)
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.x + 12, this.y - 8);
                    ctx.lineTo(this.x + 20, this.y + 4);
                    ctx.closePath();
                    ctx.stroke();
                    // dots
                    ctx.fillStyle = color;
                    ctx.fillRect(this.x - 1.5, this.y - 1.5, 3, 3);
                    ctx.fillRect(this.x + 10.5, this.y - 9.5, 3, 3);
                    ctx.fillRect(this.x + 18.5, this.y + 2.5, 3, 3);
                } else if (this.type === 2) {
                    // Orbit dotted arc
                    ctx.setLineDash([2, 4]);
                    ctx.beginPath();
                    ctx.arc(this.x, this.y + 30, 40, -Math.PI*0.7, -Math.PI*0.3);
                    ctx.stroke();
                } else if (this.type === 3) {
                    ctx.setLineDash([2, 4]);
                    ctx.beginPath(); ctx.arc(this.x, this.y, 14 + Math.sin(this.angle * 8) * 3, -Math.PI * .8, Math.PI * .15); ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x + 11, this.y - 7); ctx.stroke();
                } else if (this.type === 4) {
                    ctx.beginPath(); ctx.arc(this.x, this.y, 8, -Math.PI * .8, Math.PI * .1); ctx.stroke();
                    ctx.beginPath(); ctx.arc(this.x, this.y, 14, -Math.PI * .8, Math.PI * .1); ctx.stroke();
                } else {
                    ctx.strokeRect(this.x - 12, this.y - 8, 24, 16);
                    ctx.beginPath();
                    ctx.moveTo(this.x - 9, this.y + 4); ctx.lineTo(this.x - 3, this.y - 3); ctx.lineTo(this.x + 3, this.y + 2); ctx.lineTo(this.x + 9, this.y - 5);
                    ctx.stroke();
                }
                ctx.restore();
            }
        }

        class Obstacle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = width + Math.random() * 200 + 100;
                
                // Research obstacles types
                const types = [
                    { name: 'wifi', isHigh: false },
                    { name: 'satellite', isHigh: false },
                    { name: 'radar', isHigh: false },
                    { name: 'signals', isHigh: false },
                    { name: 'ufo', isHigh: true },
                    { name: 'binary', isHigh: true },
                    { name: 'equation1', isHigh: true },
                    { name: 'equation2', isHigh: true },
                    { name: 'rocket', isHigh: false },
                    { name: 'asteroid', isHigh: false },
                    { name: 'tower', isHigh: false },
                    { name: 'mimo', isHigh: false },
                    { name: 'constellation', isHigh: true }
                ];
                
                const select = types[Math.floor(Math.random() * types.length)];
                this.type = select.name;
                this.isHigh = select.isHigh;
                
                // High obstacles float at head height, ground ones stand on ground
                this.y = this.isHigh ? groundY - 48 : groundY - 5;
                this.speed = 4.0;
            }
            update() {
                this.x -= this.speed;
            }
            draw(isDark) {
                const lineColor = isDark ? '#ffffff' : '#0f172a';
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.scale(1.35, 1.35);
                ctx.translate(-this.x, -this.y);
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 1.5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                if (this.type === 'wifi') {
                    // Wi-Fi Waves
                    ctx.fillStyle = lineColor;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y - 2, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(this.x, this.y - 2, 6, -Math.PI * 0.75, -Math.PI * 0.25);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(this.x, this.y - 2, 12, -Math.PI * 0.75, -Math.PI * 0.25);
                    ctx.stroke();
                } else if (this.type === 'satellite') {
                    // Satellite Doodles
                    ctx.beginPath();
                    ctx.arc(this.x, this.y - 12, 5, 0, Math.PI * 2); // body
                    ctx.stroke();
                    // Panels
                    ctx.strokeRect(this.x - 14, this.y - 15, 6, 6);
                    ctx.strokeRect(this.x + 8, this.y - 15, 6, 6);
                    // connectors
                    ctx.beginPath();
                    ctx.moveTo(this.x - 8, this.y - 12); ctx.lineTo(this.x - 5, this.y - 12);
                    ctx.moveTo(this.x + 5, this.y - 12); ctx.lineTo(this.x + 8, this.y - 12);
                    ctx.stroke();
                } else if (this.type === 'radar') {
                    // Radar tower
                    ctx.beginPath();
                    ctx.moveTo(this.x - 6, this.y);
                    ctx.lineTo(this.x, this.y - 15);
                    ctx.lineTo(this.x + 6, this.y);
                    ctx.moveTo(this.x - 3, this.y - 8);
                    ctx.lineTo(this.x + 3, this.y - 8);
                    ctx.stroke();
                    // Dish
                    ctx.beginPath();
                    ctx.arc(this.x, this.y - 20, 6, Math.PI * 0.1, Math.PI * 0.9, true);
                    ctx.stroke();
                } else if (this.type === 'signals') {
                    // Oscillating wave
                    ctx.beginPath();
                    ctx.moveTo(this.x - 12, this.y - 6);
                    ctx.bezierCurveTo(this.x - 6, this.y - 18, this.x - 6, this.y + 6, this.x, this.y - 6);
                    ctx.bezierCurveTo(this.x + 6, this.y - 18, this.x + 6, this.y + 6, this.x + 12, this.y - 6);
                    ctx.stroke();
                } else if (this.type === 'ufo') {
                    // Floating UFO saucer
                    ctx.beginPath();
                    ctx.ellipse(this.x, this.y - 2, 10, 4, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(this.x, this.y - 4, 5, Math.PI, 0);
                    ctx.stroke();
                } else if (this.type === 'binary') {
                    // Binary digital
                    ctx.fillStyle = lineColor;
                    ctx.font = '700 0.82rem var(--font-mono)';
                    ctx.fillText('01', this.x - 8, this.y + 4);
                } else if (this.type === 'equation1') {
                    // Math equation
                    ctx.fillStyle = lineColor;
                    ctx.font = 'italic 600 0.72rem var(--font-body)';
                    ctx.fillText('e^{jωt}', this.x - 12, this.y + 3);
                } else if (this.type === 'equation2') {
                    // Nabla curl
                    ctx.fillStyle = lineColor;
                    ctx.font = 'italic 700 0.8rem var(--font-body)';
                    ctx.fillText('∇×E', this.x - 12, this.y + 3);
                }
                if (this.type === 'rocket') {
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y - 22); ctx.lineTo(this.x + 6, this.y - 6); ctx.lineTo(this.x - 6, this.y - 6); ctx.closePath(); ctx.stroke();
                    ctx.beginPath(); ctx.arc(this.x, this.y - 14, 2, 0, Math.PI * 2); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(this.x - 3, this.y - 6); ctx.lineTo(this.x - 6, this.y); ctx.moveTo(this.x + 3, this.y - 6); ctx.lineTo(this.x + 6, this.y); ctx.stroke();
                } else if (this.type === 'asteroid') {
                    ctx.beginPath(); ctx.arc(this.x + 3, this.y - 9, 8, 0, Math.PI * 2); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(this.x - 6, this.y - 7); ctx.lineTo(this.x - 16, this.y - 2); ctx.moveTo(this.x - 7, this.y - 13); ctx.lineTo(this.x - 19, this.y - 17); ctx.stroke();
                    ctx.beginPath(); ctx.arc(this.x + 5, this.y - 11, 1.4, 0, Math.PI * 2); ctx.stroke();
                } else if (this.type === 'tower') {
                    ctx.beginPath(); ctx.moveTo(this.x - 7, this.y); ctx.lineTo(this.x, this.y - 26); ctx.lineTo(this.x + 7, this.y); ctx.moveTo(this.x - 5, this.y - 10); ctx.lineTo(this.x + 5, this.y - 10); ctx.moveTo(this.x - 3, this.y - 18); ctx.lineTo(this.x + 3, this.y - 18); ctx.stroke();
                    ctx.beginPath(); ctx.arc(this.x, this.y - 27, 8, -Math.PI * .85, -Math.PI * .15); ctx.stroke();
                } else if (this.type === 'mimo') {
                    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(this.x - 9 + i * 6, this.y); ctx.lineTo(this.x - 9 + i * 6, this.y - 20); ctx.stroke(); ctx.beginPath(); ctx.arc(this.x - 9 + i * 6, this.y - 22, 2, 0, Math.PI * 2); ctx.stroke(); }
                    ctx.beginPath(); ctx.moveTo(this.x - 12, this.y); ctx.lineTo(this.x + 12, this.y); ctx.stroke();
                } else if (this.type === 'constellation') {
                    ctx.beginPath(); ctx.moveTo(this.x - 12, this.y); ctx.lineTo(this.x - 2, this.y - 12); ctx.lineTo(this.x + 11, this.y - 4); ctx.stroke();
                    ctx.fillStyle = lineColor;
                    [[-12, 0], [-2, -12], [11, -4]].forEach(([dx, dy]) => ctx.fillRect(this.x + dx - 1, this.y + dy - 1, 2, 2));
                }
                ctx.restore();
            }
        }

        function resize() {
            const rect = coverCanvas.parentElement.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            coverCanvas.width = Math.floor(width * pixelRatio);
            coverCanvas.height = Math.floor(height * pixelRatio);
            ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            groundY = height - 20;
            if (width < 600) {
                // Mobile layout: move astronaut a little left of the middle to avoid profile photo on the right
                astronaut.x = Math.min(130, width * 0.36);
                companionPlane.x = astronaut.x + 55;
            } else {
                astronaut.x = Math.max(120, width * 0.63);
                companionPlane.x = astronaut.x + 90;
            }
        }

        resize();
        window.addEventListener('resize', resize);

        // Generate elements
        stars = Array.from({ length: 54 }, () => new Star());
        backgroundDoodles = Array.from({ length: 8 }, () => new BackgroundDoodle());
        
        // Autoplay Dino Spawning intervals
        function updateGame() {
            // Scroll obstacles and filter offscreen
            obstacles.forEach(obs => obs.update());
            obstacles = obstacles.filter(obs => obs.x > -40);
            
            // Spawn new obstacle if last is far enough
            if (obstacles.length === 0 || (width - obstacles[obstacles.length - 1].x > Math.random() * 250 + 250)) {
                obstacles.push(new Obstacle());
            }
            
            // 1. Astronaut AI Autopilot Bot decision making
            let nextObs = null;
            let minDist = Infinity;
            
            obstacles.forEach(obs => {
                const dist = obs.x - astronaut.x;
                if (dist > -12 && dist < minDist) {
                    minDist = dist;
                    nextObs = obs;
                }
            });
            
            if (nextObs && minDist < 95) {
                if (nextObs.isHigh) {
                    if (!astronaut.isJumping && !astronaut.isDucking) {
                        astronaut.isDucking = true;
                        astronaut.duckTimer = 22;
                    }
                } else {
                    if (!astronaut.isJumping && !astronaut.isDucking) {
                        astronaut.isJumping = true;
                        astronaut.vy = -8.5;
                    }
                }
            }
            
            // 2. Companion Paper Plane AI Autopilot Bot (dodges obstacles before astronaut!)
            let nextPlaneObs = null;
            let minPlaneDist = Infinity;
            
            obstacles.forEach(obs => {
                const dist = obs.x - companionPlane.x;
                if (dist > -12 && dist < minPlaneDist) {
                    minPlaneDist = dist;
                    nextPlaneObs = obs;
                }
            });
            
            if (nextPlaneObs && minPlaneDist < 85) {
                if (nextPlaneObs.isHigh) {
                    if (!companionPlane.isJumping && !companionPlane.isDucking && !astronaut.isFloating) {
                        companionPlane.isDucking = true;
                        companionPlane.duckTimer = 20;
                    }
                } else {
                    if (!companionPlane.isJumping && !companionPlane.isDucking && !astronaut.isFloating) {
                        companionPlane.isJumping = true;
                        companionPlane.vy = -8.0;
                    }
                }
            }
            
            astronaut.update();
            companionPlane.update();
        }

        function loop() {
            // The runner remains an ink-on-paper illustration in both site themes.
            const isDark = false;
            
            // Pure white cover background in light mode, slate in dark mode
            ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
            ctx.fillRect(0, 0, width, height);
            
            // 1. Draw Background elements
            stars.forEach(star => {
                star.update();
                star.draw(isDark);
            });
            
            backgroundDoodles.forEach(doodle => {
                doodle.update();
                doodle.draw(isDark);
            });
            
            // 2. Draw ground line (minimalist line art)
            ctx.save();
            ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(width, groundY);
            ctx.stroke();
            
            // Tiny rolling ground dust lines
            ctx.strokeStyle = isDark ? '#1e293b' : '#f1f5f9';
            ctx.lineWidth = 1;
            const dashOffset = (time * 4) % 100;
            ctx.setLineDash([5, 45]);
            ctx.beginPath();
            ctx.moveTo(-dashOffset, groundY + 4);
            ctx.lineTo(width - dashOffset, groundY + 4);
            ctx.stroke();
            ctx.restore();
            
            // 3. Update & Draw main animation objects
            updateGame();
            
            obstacles.forEach(obs => obs.draw(isDark));
            astronaut.draw(isDark);
            
            // Position companion paper plane (precedes astronaut, dodging obstacles first)
            const sparkPlane = coverCanvas.parentElement.querySelector('.cover-spark-plane');
            if (sparkPlane) {
                const pxY = groundY + companionPlane.y;
                sparkPlane.style.top = `${pxY}px`;
                sparkPlane.style.left = `${companionPlane.x}px`;
            }
            

            
            time++;
            if (!reduceMotion) requestAnimationFrame(loop);
        }
        
        loop();
    }
});
