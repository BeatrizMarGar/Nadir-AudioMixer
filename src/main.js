import AudioView from "./ui/AudioView.js";

class App {
    constructor(){
        this.ui = new AudioView();
        this.init();
    }

    init(){
        this.ui.sliders.air.onInput((valor) => {
            document.getElementById('air_status').innerText = `Volumen: ${valor}`;
        });
    }
}

const app = new App();