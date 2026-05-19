export default class AudioManager{
    constructor(){
        this.ctx = null;
        this.masterGain = null;
        this.buffers = {};
        this.channels = {};
    }

    get trackIds(){
        return Object.keys(this.buffers);
    }

init() {
    if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (this.ctx.state === 'suspended') {
        this.ctx.resume();
    }

    if (!this.masterGain) {
        this.masterGain = this.ctx.createGain();
        // Forzamos el valor directo a 1 (100% de potencia sin filtros)
        this.masterGain.gain.value = 1; 
        this.masterGain.connect(this.ctx.destination);
        console.log("🔊 Master Gain totalmente abierto al 100%.");
    }
}

    changeVol(nuevoValor){
        if(this.masterGain){
            this.masterGain.gain.value = nuevoValor;
        }
    }

    async preloadTracks(){
        try{
            const configResponse = await fetch('./src/assets/audio-catalog.json')
            const soundCatalog = await configResponse.json(); //objeto Json legible

            console.log("Catálogo cargado")

            const list = Object.entries(soundCatalog).map(([id, url]) => {
                return this.loadSample(id, url);
            })
            await Promise.all(list);
        }
        catch (error){
            console.error("Error cargando el catálogo:", error)
        }
    }

async loadSample(id, url){
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        
        // Si no hay contexto todavía para decodificar, creamos uno básico
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.buffers[id] = audioBuffer;
        console.log(`✓ Audio [${id}] decodificado con éxito.`);
    }
    catch (error) {
        console.error(`Error al cargar el audio [${id}]:`, error);
    }
}

    playTrack(id){
        this.init();
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

    setTrackVolume(id, newValue){
    if (this.channels[id]){
        // gainNode es el nodo completo. Su propiedad de volumen es .gain
        this.channels[id].gain.gain.value = newValue;
        
        console.log(`Canal [${id}] -> Volumen asignado a:`, newValue);
    }
    else {
        console.warn(`No se pudo cambiar el volumen porque [${id}] no está activo`);
    }
}
}