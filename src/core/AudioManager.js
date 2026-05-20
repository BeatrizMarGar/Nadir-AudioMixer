export default class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.buffers = {};
        this.rawBuffers = {}; 
        this.channels = {};
    }

    get trackIds() {
        return Object.keys(this.rawBuffers);
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
            this.masterGain.gain.value = 1; 
            this.masterGain.connect(this.ctx.destination);
            console.log("Master Gain totalmente abierto al 100%.");
        }
    }

    changeVol(nuevoValor) {
        if (this.masterGain) {
            this.masterGain.gain.value = nuevoValor;
        }
    }

    async preloadTracks() {
        try {
            const configResponse = await fetch('./src/assets/audio-catalog.json');
            if (!configResponse.ok) {
                throw new Error(`No se pudo cargar el catálogo JSON (Error ${configResponse.status})`);
            }

            const soundCatalog = await configResponse.json();
            console.log("Catálogo JSON leído correctamente:", soundCatalog);

            // 1. Descargamos todos los archivos en bruto en paralelo
            const descargas = Object.entries(soundCatalog).map(([id, url]) => this.loadSample(id, url));
            await Promise.all(descargas);
            console.log("¡Todos los archivos han sido descargados en memoria!");

            // 2. Decodificamos AUTOMÁTICAMENTE usando un contexto offline que el navegador no bloquea
            console.log("Iniciando decodificación automática en segundo plano...");
            const offlineCtx = new OfflineAudioContext(1, 44100, 44100);
            
            for (const id of Object.keys(this.rawBuffers)) {
                try {
                    const copiaBytes = this.rawBuffers[id].slice(0);
                    this.buffers[id] = await offlineCtx.decodeAudioData(copiaBytes);
                    console.log(`Audio [${id}] decodificado automáticamente al arrancar.`);
                } catch (err) {
                    console.error(`Error decodificando [${id}] en el arranque:`, err);
                }
            }
            console.log("Todos los audios están decodificados en RAM.");
        }
        catch (error) {
            console.error("ERROR CRÍTICO EN PRECARGA:", error);
        }
    }

    async loadSample(id, url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error ${response.status} al descargar el archivo para [${id}]`);
            }
            const arrayBuffer = await response.arrayBuffer();
            this.rawBuffers[id] = arrayBuffer;
            console.log(`Archivo [${id}] descargado.`);
        }
        catch (error) {
            console.error(`Error en loadSample para [${id}]:`, error);
        }
    }

    // Levanta los nodos de audio instantáneamente porque los buffers ya existen en RAM
    inicializarCanalesReales() {
        this.init();
        
        Object.keys(this.buffers).forEach(id => {
            if (this.channels[id]) return;

            try {
                const source = this.ctx.createBufferSource();
                source.buffer = this.buffers[id];
                source.loop = true;

                const gainNode = this.ctx.createGain();
                gainNode.gain.value = 0; // Nacen en silencio

                source.connect(gainNode);
                gainNode.connect(this.masterGain);
                source.start(0);

                this.channels[id] = {
                    source: source,
                    gain: gainNode
                };
            } catch (error) {
                console.error(`Error al instanciar nodo para [${id}]:`, error);
            }
        });

        console.log("Todos los canales reales listos para mezclar de inmediato.");
    }

    setTrackVolume(id, newValue) {
        if (this.channels[id]) {
            this.channels[id].gain.gain.value = newValue;
        } else {
            console.warn(`No se pudo cambiar el volumen porque [${id}] no está listo.`);
        }
    }
}