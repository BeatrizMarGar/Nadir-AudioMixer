import SliderComponent from './SliderComponent.js';

export default class AudioView{
    constructor(){
        this.sliders = {
            rain: new SliderComponent('rain', 'Lluvia'),
            air: new SliderComponent('air', 'Aire'),
            storm: new SliderComponent('storm', 'Tormenta')
        }
        this.presetsButtons = document.querySelectorAll('.preset-btn')
    }

    bindPresetsEvents(onLoadPreset, onSavePreset){
        this.presetsButtons.forEach(button =>{
            let pressTimer = null;
            const presetId = button.getAttribute('data-preset');

            const startPress = (e) =>{
                e.preventDefault();
                pressTimer = setTimeout(() => {
                    onSavePreset(presetId);
                    pressTimer = null;
                }, 2000);
            }

            const cancelPress = () => {
                if (pressTimer !== null){
                    clearTimeout(pressTimer);
                    pressTimer = null;
                    onLoadPreset(presetId)
                }
            }

            button.addEventListener('mousedown', startPress);
            button.addEventListener('touchstart', startPress);
            
            button.addEventListener('mouseup', cancelPress);
            button.addEventListener('touchend', cancelPress);

            button.addEventListener('mouseleave', () =>{
                if (pressTimer) clearTimeout(pressTimer);
            })
        })
    }

    updateSliderUI(id, valorDestino, onAnimateFrame) {
        const sliderNode = this.sliders[id];

        if (sliderNode && sliderNode.input){
            const valorInicio = parseFloat(sliderNode.input.value);
            const duracion = 100;
            const tiempoInicio = performance.now();

            const animar = (tiempoActual) => {
                const tiempoTranscurrido = tiempoActual - tiempoInicio;
                
                const t = Math.min(tiempoTranscurrido / duracion, 1);

                // Fórmula matemática de Interpolación Lineal (Lerp)
                const valorActual = valorInicio + (valorDestino - valorInicio) * t;

                sliderNode.input.value = valorActual;

                const statusLabel = document.getElementById(`${id}_status`);
                if (statusLabel) {
                    statusLabel.innerHTML = `Volumen: ${valorActual.toFixed(2)}`;
                }

                if (onAnimateFrame) {
                    onAnimateFrame(valorActual);
                }

                // Si no hemos llegado a los 100ms, pedimos el siguiente fotograma
                if (t < 1) {
                    requestAnimationFrame(animar);
                }
            };

            requestAnimationFrame(animar);
        }
    }
}