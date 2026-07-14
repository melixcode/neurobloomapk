/**
 * NeuroBloom - Profesyonel Konuşma Terapisi Destek Platformu
 * Mimari Yapı: Vanilla JS Component-Driven State Management
 */

// Global State / Durum Yönetimi
const AppState = {
    userRole: 'child', // child | parent | therapist
    xp: 140,
    level: 2,
    streak: 3,
    completedTasks: [],
    badges: [
        { id: 'first_login', title: 'İlk Adım', desc: 'NeuroBloom Dünyasına Giriş Yaptın!', icon: '🚀', unlocked: true },
        { id: 'first_exercise', title: 'İlk Kelime', desc: 'İlk Terapi Egzersizini Tamamladın.', icon: '🗣️', unlocked: true },
        { id: 'streak_7', title: 'Alev Alev', desc: '7 Günlük Seri Başarısı.', icon: '🔥', unlocked: false }
    ],
    games: [
        { id: 1, name: 'Balon Patlatma', desc: 'Balonları hecelerle şişirip patlat!', icon: '🎈', type: 'Letter' },
        { id: 2, name: 'Hece Treni', desc: 'Doğru vagonları birleştir, tren kalkıyor.', icon: '🚂', type: 'Syllable' },
        { id: 3, name: 'Hece Merdiveni', desc: 'Her doğru seste bir basamak yukarı tırman.', icon: '🪜', type: 'Syllable' },
        { id: 4, name: 'Harf Merdiveni', desc: 'Harfleri sırala, zirveye ulaş.', icon: '🧗', type: 'Letter' },
        { id: 5, name: 'Ses Avcısı', desc: 'Etrafa gizlenmiş gizemli sesleri yakala.', icon: '🏹', type: 'Phoneme' },
        { id: 6, name: 'Konuşkan Papağan', desc: 'Söylediklerini sadık dostumuz tekrar etsin.', icon: '🦜', type: 'Word' },
        { id: 7, name: 'Ses Roketi', desc: 'Doğru telaffuz motoru ateşler!', icon: '🚀', type: 'Sentence' },
        { id: 8, name: 'Balık Yakala', desc: 'Heceli balıkları oltayla sudan çıkar.', icon: '🐟', type: 'Syllable' },
        { id: 9, name: 'Renk Bahçesi', desc: 'Renk adlarını seslendir, bahçen yeşersin.', icon: '🏡', type: 'Word' },
        { id: 10, name: 'Kelime Yıldızları', desc: 'Yıldızları birleştir, kelimeni parlat.', icon: '⭐', type: 'Word' }
    ]
};

class NeuroBloomApp {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.loadStorage();
        this.initRouting();
        this.initRoomComponent();
        this.renderGamesList();
        this.renderBadges();
    }

    initElements() {
        // Ekranlar
        this.splashScreen = document.getElementById('splash-screen');
        this.loginScreen = document.getElementById('login-screen');
        this.mainContent = document.getElementById('main-content');
        
        // Butonlar ve Tetikleyiciler
        this.btnSplashStart = document.getElementById('btn-splash-start');
        this.roleCards = document.querySelectorAll('.role-card');
        this.navItems = document.querySelectorAll('.bottom-nav .nav-item');
        this.subViews = document.querySelectorAll('.sub-view');
        
        // Global Modal Elementleri
        this.modal = document.getElementById('global-modal');
        this.modalCloseBtn = document.getElementById('modal-close-btn');
    }

    bindEvents() {
        // Splash geçişi
        this.btnSplashStart.addEventListener('click', () => {
            this.switchView(this.splashScreen, this.loginScreen);
        });

        // Rol Seçimi
        this.roleCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const role = e.currentTarget.getAttribute('data-role');
                AppState.userRole = role;
                this.adaptInterfaceToRole(role);
                this.switchView(this.loginScreen, this.mainContent);
                this.saveStorage();
            });
        });

        // Alt Navigasyon Yapısı (Dinamik Routing)
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.navItems.forEach(n => n.classList.remove('active'));
                const clickedItem = e.currentTarget;
                clickedItem.classList.add('active');
                
                const targetViewId = clickedItem.getAttribute('data-target');
                this.navigateToSubView(targetViewId);
            });
        });

        // Modal Kapatma
        this.modalCloseBtn.addEventListener('click', () => {
            this.modal.classList.remove('active');
        });

        // Dashboard Kiremit Linkleri
        document.querySelectorAll('.grid-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const targetViewId = e.currentTarget.getAttribute('data-target');
                this.navigateToSubView(targetViewId);
                
                // Navigasyon barındaki ikonu da eşleştir ve güncelle
                this.navItems.forEach(n => {
                    if(n.getAttribute('data-target') === targetViewId) {
                        this.navItems.forEach(x => x.classList.remove('active'));
                        n.classList.add('active');
                    }
                });
            });
        });
    }

    switchView(fromView, toView) {
        fromView.classList.remove('active');
        toView.classList.add('active');
    }

    navigateToSubView(viewId) {
        this.subViews.forEach(v => v.classList.remove('active'));
        const targetView = document.getElementById(viewId);
        if(targetView) {
            targetView.classList.add('active');
        }
        
        // Egzersiz sekmesine geçildiyse Donanım API'lerini simüle et/hazırla
        if(viewId === 'view-exercises') {
            this.initHardwareAPIs();
        }
    }

    adaptInterfaceToRole(role) {
        // Terapist ve Ebeveyn panellerini rol durumuna göre güvenli açma/kapama mantığı
        if(role === 'parent') {
            this.navigateToSubView('view-parent-panel');
        } else if (role === 'therapist') {
            this.navigateToSubView('view-therapist-panel');
        } else {
            this.navigateToSubView('view-home');
        }
    }

    /**
     * Browser Donanım API Katmanı (Microphone & Camera)
     */
    async initHardwareAPIs() {
        const videoElement = document.getElementById('user-camera');
        const micText = document.getElementById('mic-text');
        const waveBars = document.getElementById('audio-wave-bars');

        try {
            // Kamera ve Mikrofon İzin İsteme (getUserMedia API)
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if(videoElement) {
                videoElement.srcObject = stream;
                document.querySelector('.cam-placeholder').style.display = 'none';
            }
            
            // Kayıt Tetikleyicisi Event Yapılandırması
            const recBtn = document.getElementById('btn-start-record');
            recBtn.onclick = () => {
                waveBars.classList.add('active');
                micText.innerText = "Dinleniyor / Analiz Ediliyor...";
                
                setTimeout(() => {
                    waveBars.classList.remove('active');
                    micText.innerText = "Mükemmel Telaffuz!";
                    this.rewardXP(20);
                }, 3000);
            };

        } catch (err) {
            console.warn("Donanım erişimi reddedildi veya cihaz yok, simülasyon moduna geçiliyor.", err);
            // Fallback (Geliştirici dostu simülatör)
            document.getElementById('btn-start-record').onclick = () => {
                waveBars.classList.add('active');
                setTimeout(() => {
                    waveBars.classList.remove('active');
                    this.showCelebrationModal("Harika Ses!", "NeuroBot seninle gurur duyuyor! +20 XP kazandın.");
                    this.rewardXP(20);
                }, 2000);
            };
        }
    }

    /**
     * Ödüllendirme ve İlerleme Sistemi (XP & Level)
     */
    rewardXP(amount) {
        AppState.xp += amount;
        if(AppState.xp >= AppState.level * 100) {
            AppState.level += 1;
            this.showCelebrationModal("SEVİYE ATLADIN! 🎉", `Tebrikler, artık Seviye ${AppState.level}'sin!`);
        }
        this.updateUIStats();
        this.saveStorage();
    }

    updateUIStats() {
        document.getElementById('stat-xp').innerText = `${AppState.xp} XP`;
        document.getElementById('stat-level').innerText = `Lv. ${AppState.level}`;
        document.getElementById('p-xp').innerText = AppState.xp;
        document.getElementById('p-level').innerText = AppState.level;
        
        // Progress bar genişliğini güncelleme
        const progressPercent = (AppState.xp % (AppState.level * 100));
        const bar = document.getElementById('home-progress-bar');
        if(bar) bar.style.width = `${progressPercent}%`;
        const textPercent = document.getElementById('progress-percent');
        if(textPercent) textPercent.innerText = `${progressPercent}%`;
    }

    /**
     * Dinamik Component Render İşlemleri
     */
    renderGamesList() {
        const container = document.getElementById('games-container');
        if(!container) return;
        container.innerHTML = AppState.games.map(game => `
            <div class="glass-card game-row-card ripple-effect" onclick="window.app.playGame('${game.name}')">
                <div class="game-info-meta">
                    <span class="game-badge-icon">${game.icon}</span>
                    <div>
                        <h4 style="font-family: var(--font-title);">${game.id}. ${game.name}</h4>
                        <p style="font-size:12px; color:var(--text-secondary);">${game.desc}</p>
                    </div>
                </div>
                <button class="btn-mini">Oyna</button>
            </div>
        `).join('');
    }

    renderBadges() {
        const container = document.getElementById('badges-container-list');
        if(!container) return;
        container.innerHTML = AppState.badges.map(badge => `
            <div class="glass-card text-center badge-item ${badge.unlocked ? '' : 'locked-badge'}" style="opacity: ${badge.unlocked ? '1' : '0.4'}; text-align:center; padding: 15px;">
                <div style="font-size: 40px; margin-bottom:8px;">${badge.icon}</div>
                <h5 style="font-family: var(--font-title);">${badge.title}</h5>
                <p style="font-size:10px; color:var(--text-secondary);">${badge.desc}</p>
            </div>
        `).join('');
    }

    playGame(gameName) {
        this.showCelebrationModal("🎮 " + gameName, "Oyun başlatılıyor! NeuroBot örnek ses çıkarmaya hazırlanıyor. Hazır ol!");
    }

    showCelebrationModal(title, msg) {
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-message').innerText = msg;
        this.modal.classList.add('active');
    }

    /**
     * Yaşayan Bot Odası Alt Bileşeni (Time System Automation)
     */
    initRoomComponent() {
        this.roomComponent = {
            changeTime: (state) => {
                const roomEl = document.getElementById('neuro-room');
                const skyObj = document.getElementById('sky-obj');
                const botBody = document.getElementById('room-bot-body');

                roomEl.className = "room-wrapper"; // SIFIRLA
                
                if(state === 'morning') {
                    roomEl.classList.add('room-morning');
                    if(skyObj) skyObj.innerText = "☀️";
                    if(botBody) botBody.style.background = "#3B6FD4"; // Standart Kıyafet
                } else if(state === 'evening') {
                    roomEl.classList.add('room-evening');
                    if(skyObj) skyObj.innerText = "🌇";
                } else if(state === 'night') {
                    roomEl.classList.add('room-night');
                    if(skyObj) skyObj.innerText = "🌙";
                    if(botBody) botBody.style.background = "#A6B1E1"; // Pijama Modu Grafiği
                }
            },
            autoDetectTime: () => {
                const hour = new Date().getHours();
                if(hour >= 6 && hour < 16) this.roomComponent.changeTime('morning');
                else if(hour >= 16 && hour < 20) this.roomComponent.changeTime('evening');
                else this.roomComponent.changeTime('night');
            }
        };
        this.roomComponent.autoDetectTime();
    }

    initRouting() {
        // Uygulama yüklendiğinde otomatik istatistik eşitleme
        this.updateUIStats();
    }

    /* Offline Veri Altyapısı (LocalStorage Wrapper) */
    saveStorage() {
        localStorage.setItem('neurobloom_state', JSON.stringify({
            xp: AppState.xp,
            level: AppState.level,
            streak: AppState.streak
        }));
    }

    loadStorage() {
        const data = localStorage.getItem('neurobloom_state');
        if(data) {
            const parsed = JSON.parse(data);
            AppState.xp = parsed.xp || 140;
            AppState.level = parsed.level || 2;
            AppState.streak = parsed.streak || 3;
        }
    }
}

// Uygulamayı DOM hazır olduğunda ayağa kaldır.
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NeuroBloomApp();
});
