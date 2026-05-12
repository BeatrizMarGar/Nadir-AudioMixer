import AudioView from "./ui/AudioView.js";

class App {
    constructor(){
        this.ui = new AudioView();
        this.init();
    }

    init(){
        this.ui.sliders.rain.onInput((valor) => {
            console.log(valor + "desde el init");
            document.getElementById('rain_status').innerText = `Volumen: ${valor}`;
        });
    }
}

const app = new App();