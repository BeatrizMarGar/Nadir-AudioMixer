import SliderComponent from './SliderComponent.js';

export default class AudioView{
    constructor(){
        this.sliders = {
            rain: new SliderComponent('rain', 'Lluvia')
        }
    }
}