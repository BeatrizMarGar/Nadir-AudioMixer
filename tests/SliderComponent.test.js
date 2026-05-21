import SliderComponent from "../src/ui/SliderComponent";

describe('Pruebas unitarias para el componente SliderComponent', () => {

    beforeEach(() => {
        document.body.innerHTML = `
            <input type="range" id="rain" min="0" max="1" step="0.01" value="0.75">
        `;
    })

    test("Caso 1: Componente enlaza con el input del DOM", () => {
        const sliderLluvia = new SliderComponent('rain', "Lluvia");

        expect(sliderLluvia.id).toBe("rain");
        expect(sliderLluvia.input).not.toBeNull();
    });

    test("Caso 2: getValue() convierte cadena de texto del HTML en número real", () => {
        const sliderLluvia = new SliderComponent('rain', "Lluvia");
        const valorNumerico = sliderLluvia.getValue();
        
        expect(valorNumerico).toBe(0.75);
        expect(typeof valorNumerico).toBe('number');
    });

    test("Caso 3: onInpunt() debe avisar cuando el usuario mueva el slider", () => {
        const sliderLluvia = new SliderComponent('rain', "Lluvia");
        //mock function
        const funcionEspia = jest.fn();

        sliderLluvia.onInput(funcionEspia);

        sliderLluvia.input.value = "0.23";
        sliderLluvia.input.dispatchEvent(new Event('input'));

        expect(funcionEspia).toHaveBeenCalledTimes(1);
        expect(funcionEspia).toHaveBeenCalledWith(0.23);
    });
})