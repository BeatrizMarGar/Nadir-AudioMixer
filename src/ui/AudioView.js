import SliderComponent from './SliderComponent.js';

export default class AudioView {
    constructor() {
        this.sliders = {
            rain: new SliderComponent('rain', 'Lluvia'),
            music: new SliderComponent('music', 'Música'),
            birds: new SliderComponent('birds', 'Pájaros')
        };
        this.presetsButtons = document.querySelectorAll('.preset-btn');
        this.popupOverlay = document.getElementById('welcome-popup');
        this.popupLoadingArea = document.getElementById('popup-loading-area');
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