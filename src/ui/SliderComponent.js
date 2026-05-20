export default class SliderComponent{
    constructor(id, labelText){
        this.id = id;
        this.input = document.getElementById(this.id);
        console.log(this.id)
    }

    getValue(){
        console.log(this.input.value)
        return parseFloat(this.input.value);
        //obtenemos el valor entre 0 y 1
    }

    onInput(callback){
        if (!this.input) {
            console.error(`Error: El elemento input con ID "${this.id}" no se encontró en el DOM.`);
            return;
        }
        this.input.addEventListener('input', (event) =>{
            callback(parseFloat(event.target.value));
        });
    }
}
