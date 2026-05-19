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
        this.input.addEventListener('input', (event) =>{
            //callback(event.target.value)
            callback(parseFloat(event.target.value));
        })
    }
}
