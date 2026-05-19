import AudioView from "./ui/AudioView.js";
import AudioManager from "./core/AudioManager.js";

class App {
    constructor(){
        this.ui = new AudioView();
        this.audio = new AudioManager();
        this.init();
    }

    async init(){
        await this.audio.preloadTracks();
        this.setupEvents();
        this.setupGlobalUnlock();
        this.setupPresets();
    }

    setupEvents(){
        const mySounds = this.audio.trackIds;
        mySounds.forEach(id => {
            const sliderNode = this.ui.sliders[id];
            if (sliderNode) {
                sliderNode.onInput((valor) => {
                    this.audio.init();
                    this.audio.playTrack(id);
                    this.audio.setTrackVolume(id,valor);
                    
                    const statusLabel = document.getElementById(`${id}_status`);
                    if (statusLabel){
                        statusLabel.innerHTML = `Volumen: ${valor}`
                    }
                });
            } else {
                console.warn(`No existe slider para ${id}`)
            }
        });
    }

    setupGlobalUnlock(){
        const unlock = () => {
            this.audio.init();
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
        }
        document.addEventListener('click', unlock);
        document.addEventListener('keydown', unlock);
    }

    setupEvents(){
        const mySounds = this.audio.trackIds;
        mySounds.forEach(id => {
            const sliderNode = this.ui.sliders[id];
            sliderNode.onInput((valor) => {
                this.audio.playTrack(id);
                this.audio.setTrackVolume(id, valor)

                const statusLabel = document.getElementById(`${id}_status`);
                if (statusLabel){
                    statusLabel.innerHTML = `Volumen: ${valor}`
                }
            })
        });
    }

    setupPresets() {
        this.ui.bindPresetsEvents(
            (id) => this.loadPreset(id),
            (id) => this.savePreset(id)
        )
    }

    savePreset(presetId){
        const currentConfiguration = {};
        const mySounds = this.audio.trackIds;

        mySounds.forEach(id => {
            const slider = this.ui.sliders[id];
            currentConfiguration[id] = slider ? slider.getValue() : 0;
        })

        localStorage.setItem(`nadir_preset_${presetId}`, JSON.stringify(currentConfiguration));
        console.log(`preset guardado ${presetId}, currentConfiguration`);
    }

    loadPreset(presetId) {
        const rawData = localStorage.getItem(`nadir_preset_${presetId}`);

        if(!rawData){
            return
        }
        
        const configuration = JSON.parse(rawData);
        console.log(`Cargando preset ${presetId}`, configuration);

        Object.entries(configuration).forEach(([soundId, valor]) => {
            this.audio.init();
            this.audio.playTrack(soundId);
            this.audio.setTrackVolume(soundId, valor);
            this.ui.updateSliderUI(soundId, valor);
        })
    }

}

const app = new App();