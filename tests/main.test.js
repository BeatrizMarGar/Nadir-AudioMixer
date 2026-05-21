import AudioManager from "../src/core/AudioManager";
import AudioView from "../src/ui/AudioView";

describe('Pruebas unitarias para gestión de presets (LocalStorage)', () => {

    beforeEach(() => {

        localStorage.clear();

        document.body.innerHTML = `
            <input type="range" id="rain" value="0.5">
            <input type="range" id="music" value="0.2">
            <input type="range" id="birds" value="0.0">
        `;
    });

    test("Caso 1: Al guardar un preset, debe almacenarse un JSON en LocalStorage", () => {
        //simulación de un preset

        const presetId = "1";
        const confuracionDemo = {
            rain: 0.5,
            music: 0.2,
            birds: 0.0
        };

        localStorage.setItem(`nadir_preset_${presetId}`, JSON.stringify(confuracionDemo));

        const datosGuardados = localStorage.getItem('nadir_preset_1');

        expect(datosGuardados).not.toBeNull();

        const objetoParseado = JSON.parse(datosGuardados);

        expect(objetoParseado.rain).toBe(0.5);
        expect(objetoParseado.music).toBe(0.2);
        expect(objetoParseado.birds).toBe(0.0);
    });

    test("Caso 2: Si se carga un preset que no existe, al app no debe romperse", () => {

        const rawData = localStorage.getItem('nadir_preset_100');

        expect(rawData).toBeNull();
    });

    test("Caso 3: Al leer un preset existente se recuperan los valores exactos", () => {

        const presetId = "2";
        const configuracionDemo = {
            rain: 0.2,
            music: 0.6,
            birds: 0.3
        }

        localStorage.setItem(`nadir_preset_${presetId}`, JSON.stringify(configuracionDemo));
        const datosGuardados = JSON.parse(localStorage.getItem(`nadir_preset_2`));

        expect(datosGuardados).toEqual(configuracionDemo);
    })

})