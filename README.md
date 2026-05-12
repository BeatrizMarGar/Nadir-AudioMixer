# Nadir: Ambient Sound Mixer

**Nadir** es un mezclador de sonidos de ambiente profesional desarrollado con **Vanilla JS** y **Web Audio API**. El proyecto está enfocado en demostrar solidez técnica mediante una arquitectura limpia y una gestión eficiente del audio en el navegador.

> **Descripción técnica:** Ambient Sound Mixer con arquitectura desacoplada (Core-UI), modular y escalable. Enfoque en calidad de software mediante Testing Unitario (Jest) y un diseño orientado a la extensibilidad.

---

## Arquitectura del Proyecto: Modelo-Vista-Controlador (MVC)

Para garantizar la escalabilidad y facilitar el testing unitario, el proyecto sigue el patrón de diseño **MVC**. Esta estructura permite un desacoplamiento efectivo entre la lógica de procesamiento de audio y la interfaz de usuario.

### Componentes:

1. **Modelo (Core/AudioManager.js)**: 
   - Gestiona el estado de las pistas de audio y la lógica de la **Web Audio API**.
   - Es totalmente independiente del DOM, lo que permite realizar pruebas unitarias con **Jest** en entornos Node.js.
   - Responsable de cálculos de ganancia, muteo y normalización de valores.

2. **Vista (UI/AudioView.js)**:
   - Se encarga exclusivamente de la renderización y manipulación del DOM.
   - Captura los eventos del usuario (sliders, botones de reproducción) y notifica al controlador.
   - No contiene lógica de negocio ni conocimiento sobre la implementación interna del audio.

3. **Controlador (Main.js)**:
   - Actúa como mediador entre el Modelo y la Vista.
   - Reacciona a los eventos de la interfaz para actualizar el modelo y viceversa.
   - Orquesta el flujo de inicialización de la aplicación y la carga de activos.

---

## Tecnologías y Herramientas

* **Lenguaje:** JavaScript (ES6+)
* **Audio:** Web Audio API
* **Testing:** Jest
* **Arquitectura:** Patrón MVC (Model-View-Controller)
* **Estilos:** CSS3 Moderno