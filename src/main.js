import AudioView from "./ui/AudioView.js";
import AudioManager from "./core/AudioManager.js";

class App {
    constructor() {
        this.ui = new AudioView();
        this.audio = new AudioManager();
        this.init();
    }

    async init() {
        await this.audio.preloadTracks();
        
        this.setupEvents();
        this.setupPresets();
        this.setupMasterDial();
        this.setupSpeakerAnimation();

        this.ui.showReadyButton(() => {
            this.audio.inicializarCanalesReales();
        });
    }

    setupEvents() {
        Object.keys(this.ui.sliders).forEach(id => {
            const sliderNode = this.ui.sliders[id];
            if (sliderNode) {
                sliderNode.onInput((valor) => {
                    this.audio.setTrackVolume(id, valor);
                    
                    const pct = valor * 100;
                    this.ui.updateScreenText(`${id.toUpperCase()}:${pct.toFixed(0)}%`);

                    const fill = document.getElementById(`fill-${id}`);
                    const thumb = document.getElementById(`thumb-${id}`);
                    const valEl = document.getElementById(`val-${id}`);
                    
                    if (fill) fill.style.height = pct + '%';
                    if (thumb) thumb.style.bottom = pct + '%';
                    if (valEl) valEl.textContent = pct.toFixed(0);

                    const statusLabel = document.getElementById(`${id}_status`);
                    if (statusLabel) {
                        statusLabel.innerHTML = `Volumen: ${valor.toFixed(2)}`;
                    }
                });
            }
        });
    }

    setupMasterDial() {
        this.ui.bindDialEvent((updatedMasterValue) => {
            this.ui.setMasterUI(updatedMasterValue);
            const norm = Math.max(0, Math.min(100, updatedMasterValue)) / 100;
            this.audio.changeVol(norm);

            Object.keys(this.ui.sliders).forEach(id => {
                const sliderNode = this.ui.sliders[id];
                if (sliderNode && sliderNode.input) {
                    sliderNode.input.value = norm;
                    this.audio.setTrackVolume(id, norm);
                }
            });
        });
    }

    setupSpeakerAnimation() {
        this.ui.startSpeakerAnimation(() => {
            let sum = 0;
            const keys = Object.keys(this.ui.sliders);
            keys.forEach(id => {
                const slider = this.ui.sliders[id];
                if (slider) sum += slider.getValue();
            });
            return sum / keys.length;
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
        
        Object.keys(this.ui.sliders).forEach(id => {
            const slider = this.ui.sliders[id];
            currentConfiguration[id] = slider ? slider.getValue() : 0;
        });

        localStorage.setItem(`nadir_preset_${presetId}`, JSON.stringify(currentConfiguration));
    }

    loadPreset(presetId) {
        const rawData = localStorage.getItem(`nadir_preset_${presetId}`);
        if (!rawData) return;
        
        const configuration = JSON.parse(rawData);

        Object.entries(configuration).forEach(([soundId, valorDestino]) => {
            this.ui.updateSliderUI(soundId, valorDestino, (valorIntermedio) => {
                this.audio.setTrackVolume(soundId, valorIntermedio);
            });
        });
    }
}

const app = new App();