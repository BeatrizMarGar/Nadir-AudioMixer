import AudioView from "./ui/AudioView.js";
import AudioManager from "./core/AudioManager.js";

class App {
    constructor(){
        this.ui = new AudioView();
        this.audio = new AudioManager();
        this.init();
    }

    init(){
        this.ui.sliders.air.onInput((valor) => {
            this.audio.init(); //creamos el contexto
            this.audio.changeVol(valor);
            document.getElementById('air_status').innerText = `Volumen: ${valor}`;
        });
    }
}

const app = new App();