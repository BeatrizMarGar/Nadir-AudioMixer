export default class AudioManager{
    constructor(){
        this.ctx = null;
        this.masterGain = null;
    }

    init(){
        if (this.ctx) return;

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        this.masterGain = this.ctx.createGain();

        this.masterGain.connect(this.ctx.destination);
    }

    //metodo para cambiar de volumen en mastergain this.masterGain.gain.value = nuevoValor;

    changeVol(nuevoValor){
        if(this.masterGain){
            this.masterGain.gain.value = nuevoValor;
        }
    }
}