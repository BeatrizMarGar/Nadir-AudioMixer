import AudioView from "./ui/AudioView.js";
import AudioManager from "./core/AudioManager.js";

class App {
    constructor() {
        this.ui = new AudioView();
        this.audio = new AudioManager();
        this.init();
    }

    async init() {
        console.log("1. Iniciando descarga y decodificación automática...");
        // Al terminar este await, los archivos ya están descargados Y decodificados automáticamente
        await this.audio.preloadTracks();
        
        console.log("2. Todo procesado en RAM. Mostrando botón y configurando interfaz...");
        this.setupEvents();
        this.setupPresets();

        this.ui.showReadyButton(() => {
            console.log("Botón ¡Adelante! pulsado. Conectando buffers al hardware de audio.");
            this.audio.inicializarCanalesReales();
        });
    }

    setupEvents() {
        const mySounds = this.audio.trackIds;
        
        if (mySounds.length === 0) {
            console.warn("No se detectaron IDs de audio en el catálogo.");
            return;
        }

        mySounds.forEach(id => {
            const sliderNode = this.ui.sliders[id];
            if (sliderNode) {
                sliderNode.onInput((valor) => {
                    this.audio.setTrackVolume(id, valor);
                    
                    const statusLabel = document.getElementById(`${id}_status`);
                    if (statusLabel) {
                        statusLabel.innerHTML = `Volumen: ${valor.toFixed(2)}`;
                    }
                });
            }
        });
    }

    setupPresets() {
        this.ui.bindPresetsEvents(
            (id) => this.loadPreset(id),
            (id) => this.savePreset(id)
        );
    }

    savePreset(presetId) {
        const currentConfiguration = {};
        const mySounds = this.audio.trackIds;

        mySounds.forEach(id => {
            const slider = this.ui.sliders[id];
            currentConfiguration[id] = slider ? slider.getValue() : 0;
        });

        localStorage.setItem(`nadir_preset_${presetId}`, JSON.stringify(currentConfiguration));
        console.log(`Preset guardado [${presetId}]:`, currentConfiguration);
    }

    loadPreset(presetId) {
        const rawData = localStorage.getItem(`nadir_preset_${presetId}`);
        if (!rawData) return;
        
        const configuration = JSON.parse(rawData);
        console.log(`Cargando preset [${presetId}]:`, configuration);

        Object.entries(configuration).forEach(([soundId, valorDestino]) => {
            this.ui.updateSliderUI(soundId, valorDestino, (valorIntermedio) => {
                this.audio.setTrackVolume(soundId, valorIntermedio);
            });
        });
    }
}

const app = new App();