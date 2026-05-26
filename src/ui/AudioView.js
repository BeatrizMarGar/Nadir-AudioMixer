import SliderComponent from './SliderComponent.js';

export default class AudioView {
    constructor() {
        this.sliders = {
            rain: new SliderComponent('rain', 'Lluvia'),
            music: new SliderComponent('music', 'Música'),
            birds: new SliderComponent('birds', 'Pájaros'),
            river: new SliderComponent('river', "Río"),
            meditation: new SliderComponent('meditation', "Meditación")
        };
        
        this.presetsButtons = document.querySelectorAll('.preset-btn');
        this.popupOverlay = document.getElementById('welcome-popup');
        this.popupLoadingArea = document.getElementById('popup-loading-area');
        this.screen = document.getElementById('screen');
        
        this.infoOpenBtn = document.getElementById('info-open');
        this.infoCloseBtn = document.getElementById('info-close');
        this.infoPopup = document.getElementById('info-popup');

        this.dialOuter = document.getElementById('dial-outer');
        this.dialDot = document.getElementById('dial-dot');
        this.dialValEl = document.getElementById('dial-val');
        this.dialDragging = false;
        this.dialStartY = 0;
        this.dialStartVal = 0;
        this.masterVal = 0;

        this.grille = document.getElementById('grille');
        this.cone = this.grille.querySelector('.speaker-cone');
        this.speakerPhase = 0;

        this.initDOMEvents();
    }

    initDOMEvents() {
        if (this.infoOpenBtn && this.infoPopup) {
            this.infoOpenBtn.addEventListener('click', () => this.infoPopup.classList.add('open'));
        }
        if (this.infoCloseBtn && this.infoPopup) {
            this.infoCloseBtn.addEventListener('click', () => this.infoPopup.classList.remove('open'));
        }
        if (this.infoPopup) {
            this.infoPopup.addEventListener('click', (e) => {
                if (e.target === this.infoPopup) this.infoPopup.classList.remove('open');
            });
        }
    }

    bindDialEvent(onDialChange) {
        if (!this.dialOuter) return;

        const startDrag = (clientY) => {
            this.dialDragging = true;
            this.dialStartY = clientY;
            this.dialStartVal = this.masterVal;
        };

        this.dialOuter.addEventListener('mousedown', (e) => {
            startDrag(e.clientY);
            e.preventDefault();
        });

        this.dialOuter.addEventListener('touchstart', (e) => {
            startDrag(e.touches[0].clientY);
        }, { passive: true });

        window.addEventListener('mousemove', (e) => {
            if (!this.dialDragging) return;
            const updatedVal = this.dialStartVal + (this.dialStartY - e.clientY) * 0.8;
            onDialChange(updatedVal);
        });

        window.addEventListener('touchmove', (e) => {
            if (!this.dialDragging) return;
            const updatedVal = this.dialStartVal + (this.dialStartY - e.touches[0].clientY) * 0.8;
            onDialChange(updatedVal);
        }, { passive: true });

        window.addEventListener('mouseup', () => { this.dialDragging = false; });
        window.addEventListener('touchend', () => { this.dialDragging = false; });
    }

    setMasterUI(v) {
        this.masterVal = Math.max(0, Math.min(100, v));
        const deg = -140 + (this.masterVal / 100) * 280;
        if (this.dialDot) this.dialDot.style.transform = `translateX(-50%) rotate(${deg}deg)`;
        if (this.dialValEl) this.dialValEl.textContent = Math.round(this.masterVal) + '%';
        if (this.screen) this.screen.textContent = 'MASTER:' + Math.round(this.masterVal) + '%';

        Object.keys(this.sliders).forEach(id => {
            const fill = document.getElementById(`fill-${id}`);
            const thumb = document.getElementById(`thumb-${id}`);
            const valEl = document.getElementById(`val-${id}`);
            
            if (fill) fill.style.height = this.masterVal + '%';
            if (thumb) thumb.style.bottom = this.masterVal + '%';
            if (valEl) valEl.textContent = Math.round(this.masterVal);
        });
    }

    updateScreenText(text) {
        if (this.screen) this.screen.textContent = text;
    }

    startSpeakerAnimation(getAvgVolumeCallback) {
        const animate = () => {
            const vol = getAvgVolumeCallback();
            if (vol < 0.01) {
                this.grille.style.transform = '';
                this.cone.style.transform = '';
            } else {
                const amp = vol * 3.5;
                const speed = 1 + vol * 5;
                this.speakerPhase += speed * 0.12;
                const dx = Math.round(Math.sin(this.speakerPhase) * amp);
                const dy = Math.round(Math.cos(this.speakerPhase * 1.3) * amp * 0.6);
                const sc = (1 + Math.abs(Math.sin(this.speakerPhase * 0.9)) * vol * 0.04).toFixed(3);
                this.grille.style.transform = `translate(${dx}px,${dy}px) scale(${sc})`;
                this.cone.style.transform = `translate(${-dx}px,${-dy}px) scale(${(1/sc).toFixed(3)})`;
            }
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    showReadyButton(onStartCallback) {
        if (this.popupLoadingArea) {
            this.popupLoadingArea.innerHTML = `
                <p class="loader-status" style="color: #4ade80;">Canales listos</p>
                <button id="start-app-btn" class="start-btn">Adelante</button>
            `;
            
            const btn = document.getElementById('start-app-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    this.hideWelcomePopup();
                    onStartCallback();
                });
            }
        }
    }

    hideWelcomePopup() {
        if (this.popupOverlay) {
            this.popupOverlay.style.opacity = '0';
            setTimeout(() => {
                this.popupOverlay.classList.add('hidden');
            }, 400);
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerText = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('visible');
        }, 50);

        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 2500);
    }

    bindPresetsEvents(onLoadPreset, onSavePreset) {
        this.presetsButtons.forEach(button => {
            let pressTimer = null;
            const presetId = button.getAttribute('data-preset');

            const startPress = (e) => {
                e.preventDefault();
                button.classList.add('preset-saving');

                pressTimer = setTimeout(() => {
                    onSavePreset(presetId);
                    button.classList.remove('preset-saving');
                    button.classList.add('preset-success');
                    this.showToast(`Preset ${presetId} guardado correctamente`);

                    setTimeout(() => {
                        button.classList.remove('preset-success');
                    }, 600);

                    pressTimer = null;
                }, 2000);
            };

            const cancelPress = () => {
                if (pressTimer !== null) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                    button.classList.remove('preset-saving');
                    onLoadPreset(presetId);
                }
            };

            button.addEventListener('mousedown', startPress);
            button.addEventListener('touchstart', startPress);
            button.addEventListener('mouseup', cancelPress);
            button.addEventListener('touchend', cancelPress);
            button.addEventListener('mouseleave', () => {
                if (pressTimer) {
                    clearTimeout(pressTimer);
                    button.classList.remove('preset-saving');
                }
            });
        });
    }

    updateSliderUI(id, valorDestino, onAnimateFrame) {
        const sliderNode = this.sliders[id];

        if (sliderNode && sliderNode.input) {
            const valorInicio = parseFloat(sliderNode.input.value);
            const duracion = 100;
            const tiempoInicio = performance.now();

            const animar = (tiempoActual) => {
                const tiempoTranscurrido = tiempoActual - tiempoInicio;
                const t = Math.min(tiempoTranscurrido / duracion, 1);
                const valorActual = valorInicio + (valorDestino - valorInicio) * t;

                sliderNode.input.value = valorActual;
                sliderNode.input.dispatchEvent(new Event('input', { bubbles: true }));

                const statusLabel = document.getElementById(`${id}_status`);
                if (statusLabel) {
                    statusLabel.innerHTML = `Volumen: ${valorActual.toFixed(2)}`;
                }

                if (onAnimateFrame) {
                    onAnimateFrame(valorActual);
                }

                if (t < 1) {
                    requestAnimationFrame(animar);
                }
            };

            requestAnimationFrame(animar);
        }
    }
}