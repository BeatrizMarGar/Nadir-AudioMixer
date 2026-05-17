export default class AudioManager{
    constructor(){
        this.ctx = null;
        this.masterGain = null;
        this.buffers = {};
        this.channels = {};
    }

    init(){
        if (this.ctx) return;

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        this.masterGain = this.ctx.createGain();

        this.masterGain.connect(this.ctx.destination);
    }

    changeVol(nuevoValor){
        if(this.masterGain){
            this.masterGain.gain.value = nuevoValor;
        }
    }

    async preloadTracks(){
        try{
            const configResponse = await fetch('../assets/audio-catalog.json')
            const soundCatalog = await configResponse.json(); //objeto Json legible

            console.log("Catálogo cargado")

            const list = Object.entries(soundCatalog).map(([id, url]) => {
                this.loadSample(id, url);
            })
        }
        catch (error){
            console.error("Error cargando el catálogo:", error)
        }
    }

    async loadSample(id, url){
        this.init()
        try {
            const response = await fetch(url)
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            this.buffers[id] = audioBuffer;
        }
        catch (error) {
            console.error(`Error al cargar el audio [${id}]:`, error)
        }
    }

    playTrack(id){

        if (!this.buffers[id]) {
            console.warn(`No es posible reproducir [${id}]: buffer no encontrado`)
            return;
        }

        if (this.channels[id]) return; //evita duplicar el canal que ya está sonando
        
        const source = this.ctx.createBufferSource();
        source.buffer = this.buffers[id];
        source.loop = true;

        const gainNode = this.ctx.createGain();
        gainNode.gain.value = 0;

        source.connect(gainNode);
        gainNode.connect(this.masterGain);
        source.start(0)
        
        this.channels[id] = {
            source: source,
            gain: gainNode
        }

    }
}