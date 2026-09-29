// - Autor: Samuel José Gomes Olivares
// - Trabajo de Fin de Grado: Los Espacios de Minkowski y su aplicación en la relatividad especial: una perspectiva matemática y computacional
// - Fecha de última modificación: 30 de mayo 2026
//
// Nota de uso:
// Este código puede ser utilizado como referencia siempre y cuando se cite correctamente al autor.
//
// Descripción:
// Código principal de la aplicación p5.js que es invocado y ejecutado por el fichero "index.html" para visualizar interactivamente el 
// Espacio de Minkowski.
//

// Posición y dimensiones de los botones
let bx = 0;     // Posición X del botón en el canvas
let by = 25;    // Posición Y del botón en el canvas
let bw = 150;   // Anchura del botón
let bh = 40;    // Altura del botón
let gap = 40;   // Distancia entre cada botón

// Variable global para controlar el slider (deslizador)
let slider;
// Variable para el botón de mostrar/quitar cuadrículas
let showGrid = false;
// Variable para el botón de mostrar/quitar el ángulo beta del diagrama
let showBeta = false;
// Variable para el botón de mostrar/quitar las hipérbolas y los puntos intersección con los ejes de O'
let showHyperbolas = false;
// Variable para el botón del cono de luz del diagrama
let showLightCone = false;
// Variable para el botón de dibujar puntos
let showPoint = false;
// Vector de puntos a dibujar
let points = [];
// Punto actualmente seleccionado (para arrastrarlo a lo largo del diagrama)
let selectedPoint = null;
// Variable para el botón de simultaneidad de eventos
let showSimult = false;
// variable para el botón de dilatación de temporal
let showTimeDilt = false;
// Variable para el botón de contracción de longitudes
let showLengthCont = false;


// Función especial de p5.js para inicializar la aplicación web
function setup() {

    // Crea el lienzo donde se dibujará el diagrama
    createCanvas(1200, 650);

    // Centrar el texto y definir tamaño base
    textAlign(CENTER, CENTER);
    textSize(16);

    // Slider que controla el ángulo beta (en grados
    // beta está entre 0 y 45 grados, ya que tan(45) = 1 <-> v = c
    slider = createSlider(0, 45, 0, 1); // Crea un un slider que va desde 0 hasta 45
    slider.position(120, 95);
    slider.style('width', '200px');
}

// Función especial de p5.js para dibujar todo el contenido de la aplicación: ejes, puntos, botones, tablas, etc.
function draw(){
    // Fondo blanco
    background(255);

    // Generamos el marco que va a contener al diagrama
    drawFrame();

    // Generamos los botones laterales izquierdos
    drawLeftButtons();

    // Aplicamos un recorte sobre cualquier cosa que se dibuje dentro del marco
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(200, 25, 600, 600); // Dimensiones del marco 600p x 600p
    drawingContext.clip();

    // Trasladar el origen del diagrama al centro del canvas 
    translate(500, 325);

    // Dibuja los ejes del observador O (ejes rojos)
    drawAxes(); // Ejes de O

    // Obtiene el valor de beta según la posición del slider
    let betaDeg = slider.value();
    // Pasar a radianes
    let beta =  betaDeg * Math.PI / 180;
    // tan(beta) = v/c. Aquí v representa directamente v/c.
    let v = Math.tan(beta); // v/c

    // Si v/c -> 1, el denominador del factor de Lorentz tiende a 0, con lo cual, gamma -> infinito
    if(v >= 0.999999) v = 1;

    // Cálculo del factor de Lorentz: gamma = 1 / sqrt(1 - (v/c)^2)
    let gamma = 1 / Math.sqrt(1 - v*v);


    // Dibuja los ejes del observador O'
    drawMovingAxes(v); 

    // Dibuja las cuadrículas (Al activar el botón)
    if (showGrid) {
        drawGridO();
        drawGridO2(v, gamma);
    }

    // Dibuja el ángulo beta
    if (showBeta){
        drawBeta(beta, v);
    }

    // Dibuja la hipérbola
    if(showHyperbolas){
        drawHyperbolas(v, gamma);
    }

    // Dibuja el cono de luz
    if(showLightCone){
        drawLightCone();
    }

    // Dibuja los puntos
    drawPoints();

    // Dibuja los elementos para observar la simultaneidad en O
    drawSimultaneityO();

    // Dibuja los elementos para observar la simultaneidad en O'
    drawSimultaneityOPrime(v, gamma);

    // Dibuja los elementos de la dilatación temporal
    drawTimeDilation(v, gamma);

    // Dibuja los elementos de la contracción de longitudes
    drawLengthContraction(v, gamma);

    // Desactivamos el recorte 
    drawingContext.restore();

    // Mensaje para insertar puntos
    if(showPoint && points.length < 2){
        push();
        resetMatrix();
        fill(0);
        textSize(16);
        textAlign(CENTER, CENTER);
        text("Haz click dentro del diagrama para insertar 2 puntos", 500, 640);
        pop();
    }

    // Dibuja la tabla que contiene el valor de v/c, factor de Lorentz y valor del ángulo beta
    drawTable(v, gamma, betaDeg); 

    // Tabla para el botón de dibujar puntos
    drawPointsTable(v, gamma);

    // Tabla para el botón de simultaneidad
    drawSimultTable();

    // Tabla para el botón de dilatación temporal
    drawTimeDilationTable(v, gamma);

    // Tabla para el botón de contracción espacial
    drawLengthTable();

    // Generamos los botones laterales derechos
    drawRightButtons();
}

// Dibuja los ejes del observador O
function drawAxes(){

    // Establece el color rojo para los ejes
    stroke(255, 0, 0);
    // Establece el grosor de la línea
    strokeWeight(2);

    // Eje x (espacial)
    line(-300, 0, 300, 0);

    // Eje ct (temporal)
    // En p5.js, el eje y aumenta hacia abajo y disminuye hacia arriba, por eso, es que se ha implementado
    // del revés para que los 'y' positivos aumenten hacia arriba y los negativos hacia abajo del eje
    line(0, -300, 0, 300);

    // Etiquetas de los ejes
    // Desactiva el contorno
    noStroke();
    // Establece que las etiquetas sean en rojo
    fill(255, 0, 0);

    // Dibuja el texto "x" sobre los ejes a 280 pixeles a la derecha del origen y 15 pixeles arriba del eje horizontal
    text("x", 280, -15);

    // Dibuja el texto "ct" sobre los ejes a 15 pixeles a la derecha del eje vertical y a 280 pixeles por encima del origen
    text("ct", 15, -280);
}

// Dibuja los ejes del observador O' (en movimiento)
function drawMovingAxes(v){

    // Establece el color azul para los ejes
    stroke(0, 0, 255);
    // Establece el grosor de la línea
    strokeWeight(2);

    // Eje temporal c tau
    line(-300 * v, 300, 300 * v, -300);

    // Eje espacial
    line(-300, 300 * v, 300, -300 * v);
    
    // Etiquetas de los ejes
    // Elimina el contorno
    noStroke();
    // Establece que las etiquetas sean en azul
    fill(0, 0, 255);

    // Dibuja el texto "x'" a 280 píxeles a la derecha del origen y 280 * v + 15 píxeles por encima del eje horizontal
    text("x'", 280, -280 * v - 15);

    // Dibuja el texto "c tau" sobre los ejes a 280 * v + 15 píxeles a la derecha del eje vertical y 280 píxeles por encima del origen
    text("cτ", 280 * v + 15, -280);
    
}

// Dibuja la tabla de valores
function drawTable(v, gamma, betaDeg){

    // Guarda el estado actual del sistema de coordenadas (traslaciones, rotaciones, estilos, etc)
    push();
    // Evita que la tabla no se dibuje en el centro del canvas o encima del diagrama o fuera de la pantalla.
    resetMatrix();
    // Mover la tabla
    translate(850, 25); 

    // Altura de la fila
    let rowH = 40;
    // Anchura de la columna 1
    let colW1 = 180;
    // Anchura de la columna 2
    let colW2 = 120;

    stroke(0);
    strokeWeight(1);
    fill(240);

    // Encabezado
    rect(0, 0, colW1 + colW2, rowH);
    fill(0);
    textAlign(CENTER, CENTER);
    text("Tabla de valores", (colW1 + colW2)/2, rowH/2);

    // Etiquetas y valores asociados
    drawRow("v/c", nf(v,1,2), 1);
    drawRow("γ (Factor de Lorentz)", gamma === Infinity ? "∞" : nf(gamma, 1, 3), 2);
    drawRow("β (grados)", nf(betaDeg, 1, 0), 3);

    pop();
}

// Función auxliar usada para crear la tabla de valores de la esquina superior derecha
function drawRow(label, value, row){
    let y = row * 40;
    let colW1 = 180;
    let colW2 = 120;

    fill(255);
    rect(0, y, colW1, 40);
    rect(colW1, y, colW2, 40);

    fill(0);
    textAlign(LEFT, CENTER);
    text(label, 10, y + 20);

    textAlign(RIGHT, CENTER);
    text(value, colW1 + colW2 - 10, y + 20);
}

// Dibujar el marco que cubre al diagrama
function drawFrame(){
    stroke(120);            
    strokeWeight(1.5);
    noFill();
    rect(200, 25, 600, 600);    
}

// Dibuja los botones izquierdos del canvas
function drawLeftButtons(){

    // Estilo de botón
    stroke(0);
    strokeWeight(1);

    // Botón de cuadrículas
    if(showGrid)
        fill(255, 255, 150);    // Cuando se presiona el botón, cambia de color (amarillo)
    else 
        fill(240);              // Caso contrario, el botón se vuelve gris
    rect(bx, by, bw, bh);
    // Botón de ángulo beta
    if(showBeta)
        fill(255, 255, 150);    // Cuando se presiona el botón, cambia de color (amarillo)
    else 
        fill(240);              // Caso contrario, el botón se vuelve gris
    rect(bx, by + (bh + gap), bw, bh);
    // Botón de hipérbolas
    if(showHyperbolas)
        fill(255, 255, 150);    // Cuando se presiona el botón, cambia de color (amarillo)
    else 
        fill(240);              // Caso contrario, el botón se vuelve gris
    rect(bx, by + 2*(bh + gap), bw, bh);
    // Botón de cono de luz
    if(showLightCone)
        fill(255, 255, 150);    // Cuando se presiona el botón, cambia de color (amarillo)
    else 
        fill(240);              // Caso contrario, el botón se vuelve gris
    rect(bx, by + 3*(bh + gap), bw, bh);

    // Etiquetas de los botones
    noStroke();
    fill(0);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text("Cuadrículas", bw/2, by + bh/2);
    text("Ángulo β", bw/2, by + (bh + gap) + bh/2);
    text("Hipérbolas", bw/2, by + 2*(bh + gap) + bh/2);
    text("Cono de luz", bw/2, by + 3*(bh + gap) + bh/2);

    // Desactivamos las negritas después de dibujar las etiquetas en los botones
    textStyle(NORMAL);
}

// Callback de p5.js (función especial) en javascript que se ejecuta automáticamente cada vez que
// el usuario hace un click en el canvas, en este caso, se ejecuta cada vez que se haga un click sobre
// los botones ya definidos.
function mousePressed(){

    // Botones izquierdos

    // Botón cuadrículas
    if(mouseX > bx && mouseX < bx + bw && 
        mouseY > 25 && mouseY < 25 + bh){
            showGrid = !showGrid;   // Para alternar ON/OFF
    }

    // Botón del ángulo beta
    if(mouseX > bx && mouseX < bx + bw &&
        mouseY > 105 && mouseY < 105 + bh) {
            showBeta = !showBeta;   // Para alternar ON/OFF
    }

    // Botón de las hipérbolas
    if(mouseX > bx && mouseX < bx + bw &&
        mouseY > 185 && mouseY < 185 + bh){
            showHyperbolas = !showHyperbolas;   // Para alternar ON/OFF
    }

    // Botón del cono de luz
    if(mouseX > bx && mouseX < bx + bw &&
        mouseY > 265 && mouseY < 265 + bh){
            showLightCone = !showLightCone; // Para alternar ON/OFF
    }

    // Botones derechos

    let bxR = bx + 850;  // bx = 850 
    let byR = by + 260;  // by = 285
    let bwR = bw + 150;  // bw = 300  

    // Botón de dibujar puntos
    if(mouseX > bxR && mouseX < bxR + bwR &&
        mouseY > byR && mouseY < byR + bh){
            showPoint = !showPoint;     // Para alternar ON/OFF 
            // Reiniciar vector de puntos
            points = [];                
            selectedPoint = null;
        }

    // Botón de simultaneidad
    if(mouseX > bxR && mouseX < bxR + bwR &&
        mouseY > byR + (bh + gap) && mouseY < byR + (bh + gap) + bh){
            showSimult = !showSimult;   // Para alternar ON/OFF
        }

    // Botón de dilatación temporal
    if(mouseX > bxR && mouseX < bxR + bwR &&
        mouseY > byR + 2*(bh + gap) && mouseY < byR + 2*(bh + gap) + bh){
            
            showTimeDilt = !showTimeDilt;   // Para alternar ON/OFF

            // Si activamos el botón y ya hay puntos, los reubicamos en el eje ct automáticamente
            if(showTimeDilt && points.length === 2) {
                points[0].x = 0;
                points[0].y = 0;
                points[1].x = 0;
            }

        }

    // Botón de contracción de longitudes
    if(mouseX > bxR && mouseX < bxR + bwR &&
        mouseY > byR + 3*(bh + gap) && mouseY < byR + 3*(bh + gap) + bh){
            showLengthCont = !showLengthCont;   // Para alternar ON/OFF
        }

    // Lógica de puntos
    if(showPoint){
        
        // Coordenadas del marco del diagrama
        if(mouseX > 200 && mouseX < 800 &&
            mouseY > 25 && mouseY < 625) {
                // Si hay menos de 2 puntos, entonces se añade uno
                if(points.length < 2){
                    points.push({
                        x: mouseX - 500,
                        y: mouseY - 325
                    });
                }

            }
    }

}

// Dibuja las cuadrículas del observador O
function drawGridO(){

    // Rojo transparente
    stroke(255, 0, 0, 60); 
    strokeWeight(1);

    // Líneas verticales
    for(let x = -300; x <= 300; x += 30){
        line(x, -300, x, 300);
    }

    // Líneas horizontales
    for(let y = -300; y <= 300; y += 30){
        line(-300, y, 300, y);
    }
}

// Dibuja las cuadrículas del observador O'
function drawGridO2(v, gamma){

    // Azul transparente
    stroke(0, 0, 255, 60);
    strokeWeight(1);

    // Líneas de c tau 
    for(let ct_p = -300; ct_p <= 300; ct_p += 30){
        beginShape();
        for(let x_p = -300; x_p <= 300; x_p += 10){
            // Inversa de Lorentz: (x, ct) en función de (x', ctau)
            let x = gamma * (x_p + v * ct_p);
            let ct = gamma * (ct_p + v * x_p);
            vertex(x, -ct); // Con signo negativo, porque en p5.js el eje Y crece hacia abajo
        }
        endShape();
    }

    // Líneas de x'
    for(let x_p = -300; x_p <= 300; x_p += 30){
        beginShape();
        for(let ct_p = -300; ct_p <= 300; ct_p += 10) {
            let x = gamma * (x_p + v * ct_p);
            let ct = gamma * (ct_p + v * x_p);
            vertex(x, -ct);
        }
        endShape();
    }
}

// Dibuja el ángulo Beta (en verde) en el diagrama
function drawBeta(beta, v){

    // Aisla estilos y texto
    push(); 
    
    // radio del arco entre los ejes
    let r = 100; 

    // Color verde transparente 
    fill(0, 255, 0, 40);
    stroke(0, 155, 0);
    strokeWeight(2);

    // Ángulo entre ct (vertical) y ctau
    let start1 = -HALF_PI;       // ct 
    let end1 = -HALF_PI + beta;  // ctau 

    // Dibuja el arco
    arc(0, 0, r, r, start1, end1, PIE);

    // Etiqueta beta para ct - ct'
    noStroke();
    fill(0, 120, 0);
    textSize(18);
    let mid1 = (start1 + end1)/2;
    text("β", r * 0.7 * cos(mid1), r * 0.7 * sin(mid1));

    // Ángulo entre x (horizontal) y x'
    stroke(0, 155, 0);
    fill(0, 255, 0, 40);

    let start2 = -beta;
    let end2 = 0;

    // Dibuja el arco
    arc(0, 0, r, r, start2, end2, PIE);

    noStroke();
    fill(0, 120, 0);
    textSize(18);
    let mid2 = (start2 + end2)/2;
    text("β", r * 0.7 * cos(mid2), r * 0.7 * sin(mid2));

    pop();
}

// Dibuja las hipérbolas equiláteras
function drawHyperbolas(v, gamma){
    push();
    noFill();
    strokeWeight(2);

    let scale = 150;

    // Hipérbola que interseca con el eje ctau
    stroke(0);
    beginShape();
    for(let x = -300; x <= 300; x += 2){
        let ct = Math.sqrt(scale*scale + x*x);
        if( ct < 300)
            vertex(x, -ct);
    }
    endShape();

    // Hipérbola que interseca con el eje x'
    beginShape();
    for(let ct = -300; ct <= 300; ct += 2){
        let x = Math.sqrt(scale*scale + ct*ct);
        if( x < 300)
            vertex(x, -ct);
    }
    endShape();

    // Puntos de intersección
    // Punto en ctau
    let p1x = scale * gamma * v;
    let p1y = -scale * gamma;

    // Punto en x'
    let p2x = scale * gamma;
    let p2y = -scale * gamma * v;

    // Dibujar los puntos
    fill(0);
    noStroke();
    // Punto en ctau
    ellipse(p1x, p1y, 8, 8);
    // Punto en x'
    ellipse(p2x, p2y, 8, 8);

    pop();
}

// Dibuja el cono de luz
function drawLightCone(){
    push();

    // Usaremos un color dorado-amarillo para que resalte
    fill(255, 255, 0, 35);
    stroke(255, 200, 0, 120);
    strokeWeight(1.5);

    // Cono del futuro
    beginShape();   // Comienza a dibujar el cono 
    vertex(0,0);
    // Línea ct = x
    vertex(300, -300);
    // Línea ct = -x
    vertex(-300, -300);
    endShape(CLOSE);    // Termina de dibujar el cono y lo cierra

    // Cono del pasado
    beginShape();   // Comienza a dibujar el cono 
    vertex(0,0);
    vertex(300, 300);
    vertex(-300, 300);
    endShape(CLOSE); // Termina de dibujar el cono y lo cierra

    // Líneas del cono (45 grados)
    stroke(255, 180, 0, 180);
    line(-300, -300, 300, 300);
    line(-300, 300, 300, -300);

    //Etiquetas
    noStroke();
    fill(200, 100, 0);
    textSize(14);
    text("ct = x", 265, -230);
    text("ct = -x", -265, -230);

    pop();
}

// Dibuja los botones derechos del canvas
function drawRightButtons(){

    push();
    resetMatrix();  // Para dibujar en coordenadas globales

    // Posiciones y dimensiones de los botones
    let bxR = bx + 850;  // bxR = 850 
    let byR = by + 260;  // byR = 285
    let bwR = bw + 150;  // bwR = 300

    // Fenómenos relativistas 
    noStroke();
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(20);

    // Posiciones de las etiquetas de los botones derechos
    let titleX = bxR + bwR/2;
    let titleY = byR - 40;

    // Título de los botones de la derecha de la aplicación
    textStyle(BOLD);
    text("Fenómenos relativistas", titleX, titleY);
    textStyle(NORMAL);
 
    // Subrayado del título
    stroke(0);
    strokeWeight(1.5);
    line(bxR, titleY + 12, bxR + bwR, titleY + 12);

    // Estética de los botones
    stroke(0);
    strokeWeight(1);

    // Botón dibujar puntos
    if(showPoint)
        fill(255, 180, 180);
    else
        fill(240);
    rect(bxR, byR, bwR, bh);

    // Dibuja el botón de simultaneidad
    if(showSimult)
        fill(255, 180, 180);
    else
        fill(240);
    rect(bxR, byR + (bh + gap), bwR, bh);

    // Dibuja el botón de dilatación temporal
    if(showTimeDilt)
        fill(255, 180, 180);
    else
        fill(240);
    rect(bxR, byR + 2*(bh + gap), bwR, bh);

    // Dibuja el botón de contracción de longitudes
    if(showLengthCont)
        fill(255, 180, 180);
    else
        fill(240);
    rect(bxR, byR + 3*(bh + gap), bwR, bh);

    // Etiquetas
    noStroke();
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("Dibujar punto(s)", bxR + bwR/2, byR + bh/2);
    text("Simultaneidad", bxR + bwR/2, byR + (bh + gap) + bh/2);
    text("Dilatación temporal", bxR + bwR/2, byR + 2*(bh + gap) + bh/2);
    text("Contracción espacial", bxR + bwR/2, byR + 3*(bh + gap) + bh/2);

    pop();

}

// Dibuja los puntos en diagrama
function drawPoints(){

    // Tamaño de las etiquetas y en negritas
    textSize(18);
    textStyle(BOLD);

    fill(0);
    noStroke();
    // índice del array
    let i = 0;
    for(let p of points){
        ellipse(p.x, p.y, 10, 10);
        
        // El punto de la primera posición siempre se llamará A y el segundo
        // se llamará B
        let label;
        if (i === 0)
            label = "A";
        else
            label = "B";

        // Dibuja la etiqueta a 10 unidades sobre el punto
        textAlign(CENTER, BOTTOM);
        text(label, p.x + 20, p.y + 15);
        i++;
    }
    textStyle(NORMAL);
}

// Función especial de interacción con el ratón que incluye la librería p5.js para arrastrar un elemento, que
// en este caso, se usa para arrastrar un punto en el diagrama
function mouseDragged(){

    if(selectedPoint == null){
        // Intenta seleccionar un punto al empezar a arrastrar
        for(let p of points){
            let px = p.x + 500;
            let py = p.y + 325;
            
            if(dist(mouseX, mouseY, px, py) < 10){
                selectedPoint = p;
                break;
            }
        }

    }

    if(selectedPoint !== null){
        let dx = mouseX - 500;
        let dy = mouseY - 325;

        // Limitar dentro del marco (600 x 600)
        if(dx > -300 && dx < 300 && dy > -300 && dy < 300){
            // Bloqueos de la dilatación temporal
            if(showTimeDilt){
                // Si el botón de dilatación está activada
                if(selectedPoint === points[0]) {
                    // A se queda en (0, 0)
                    selectedPoint.x = 0;
                    selectedPoint.y = 0;
                }
                else {
                    // B solo se mueve en vertical (eje ct)
                    selectedPoint.x = 0;
                    selectedPoint.y = dy;
                }
            }

            if(showLengthCont){
                // Forzamos a que ambos puntos tengan siempre la misma coordenada temporal (simultáneos en O)
                if(selectedPoint == points[0]){
                    points[0].x = dx;
                    points[0].y = dy;
                    
                    if(points[1])
                        points[1].y = dy;   // Mantenemos el punto B a la altura de A
                } else{
                    points[1].x = dx;
                    points[1].y = dy;

                    if(points[0])
                        points[0].y = dy;   // Mantenemos el punto A a la altura de B
                }

            }
            else{
                // Normalidad
                selectedPoint.x = dx;
                selectedPoint.y = dy;
            }
        }
    }

}

// Función especial de interacción de p5.js para soltar el elemento seleccionado por el ratón, que en este caso,
// se usa para soltar un punto del diagrama seleccionado
function mouseReleased(){
    selectedPoint = null;
}

// Dibuja la simultaneidad de dos eventos para el observador O (rojo)
function drawSimultaneityO(){

    // Condiciones para que tenga sentido dibujar:
    // 1. El botón de simultaneidad debe estar encendido
    // 2. El botón de dibujar puntos debe estar encendido
    // 3. Deben existir exactamente 2 puntos
    if(!showSimult || !showPoint || points.length !== 2) return;

    // Puntos A y B en coordenadas del diagrama
    let A = points[0];
    let B = points[1];

    // Dibujamos el área entre las líneas discontinuas que pasan por A y por B
    noStroke();
    fill(250, 0, 0, 40);    // Rojo transparente
    beginShape();
    vertex(-300, A.y);
    vertex(300, A.y);
    vertex(300, B.y);
    vertex(-300, B.y);
    endShape(CLOSE);

    // Ahora, dibujamos las rectas discontinuas paralelas al eje espacial x

    // Estética de las líneas
    stroke(180, 0, 0);  // Color Rojo
    strokeWeight(2);
    drawingContext.setLineDash([5, 5]); // Línea discontinua

    // Línea que pasa por A
    line(-300, A.y, 300, A.y);

    // Línea que pasa por B
    line(-300, B.y, 300, B.y);

    // Restaurar estilo de línea continua
    drawingContext.setLineDash([]);

    // Flecha de separación entre ambas líneas
    let y1 = A.y;
    let y2 = B.y;

    // Asegurar y1 sea el punto superior
    if(y2 < y1){
        let temp = y1;
        y1 = y2;
        y2 = temp;
    }

    // Desplazamiento de la flecha respecto del origen
    let xArrow = 40;

    stroke(0);
    strokeWeight(2);

    // Barra superior 
    line(xArrow - 15, y1, xArrow + 15, y1);

    // Barra inferior
    line(xArrow -15, y2, xArrow + 15, y2);

    // Línea vertical entre barras
    line(xArrow, y1, xArrow, y2);

    // Etiqueta c delta t
    noStroke();
    fill(0);
    textSize(18);
    text("cΔt", xArrow + 30, (y1+ y2)/2);
}

// Dibuja la tabla de valores para la simultaneidad 
function drawSimultTable(){

    // Solo mostrar si el botón de simultaneidad está activo y ya hay 2 puntos
    if(!showSimult) return;
    if(points.length !== 2) return;

    // Calcula el valor de cΔt (observador O)
    let A = points[0];
    let B = points[1];
    let ctA = -A.y;
    let ctB = -B.y;
    let delta_t = Math.abs(ctA - ctB);

    // Calcular el valor de cΔτ (Observador O')
    let delta_tp = window.delta_tp ?? "";    

    // Dibujar tabla

    push();
    resetMatrix();

    // Posición y dimensiones de la tabla
    let x = 0;         // Posición X de la tabla
    let y = 350;        // Posición Y de la tabla 
    let col1 = 70;     // Anchura de la columna 1
    let col2 = 80;     // Anchura de la columna 2
    let rowH = 40;      // Altura de las filas

    stroke(0);
    strokeWeight(1);
    fill(240);

    // Encabezado
    rect(x, y, col1 + col2, rowH);
    fill(0);
    textAlign(CENTER, CENTER);
    text("Simultaneidad", x + (col1 + col2)/2, y + rowH/2);

    // Fila 1 --> cΔt
    fill(255, 230, 230);
    rect(x, y + rowH, col1, rowH);
    rect(x + col1, y + rowH, col2, rowH);

    fill(0);
    textAlign(LEFT, CENTER);
    text("cΔt", x + 10, y + rowH + rowH/2);

    textAlign(RIGHT, CENTER);
    text(nf(delta_t, 1, 0), x + col1 + col2 - 10, y + rowH + rowH/2);


    // Fila 2 --> cΔτ
    fill(230, 230, 255);
    rect(x, y + 2*rowH, col1, rowH);
    rect(x + col1, y + 2*rowH, col2, rowH);

    fill(0);
    textAlign(LEFT, CENTER);
    text("cΔτ", x + 10, y + 2*rowH + rowH/2);

    textAlign(RIGHT, CENTER);
    text(nf(delta_tp, 1, 0), x + col1 + col2 - 10, y + 2*rowH + rowH/2);

    pop();
}

// Dibuja la simultaneidad de dos eventos para el observador O' (azul) en el diagrama
function drawSimultaneityOPrime(v, gamma){

    // Al igual que para el observador O, sólo se dibuja la simultaneidad si el botón de simultaneidad
    // está activado y si hay 2 puntos dibujados en el diagrama
    if(!showSimult || points.length !== 2) return;

    // Puntos A y B
    let A = points[0];
    let B = points[1];

    // Transformamos las coordenadas de O a O' (Lorentz)
    let ctA = -A.y;     // Coordenada temporal del punto A
    let xA = A.x;       // Coordenada espacial del punto A
    let ctB = -B.y;     // Coordenada temporal del punto B
    let xB = B.x;       // Coordenada espacial del punto B

    // Evaluamos los deltas base antes de multiplicar por gamma
    let diffA = ctA - v * xA;
    let diffB = ctB - v * xB;

    let ctA_prime, ctB_prime, delta_ctau;

    // Condicionales para evitar el NaN en la tabla ocasionados por indeterminaciones 
    // del tipo infinito - infinito o infinito · 0.
    if(gamma === Infinity) {
        if(Math.abs(diffB - diffA) < 0.0001){
            // A y B son simultáneos para el observador O' (infinito * 0)
            ctA_prime = 0;
            ctB_prime = 0;
            delta_ctau = 0;
        } else {
            // A y B no son simultáneos para el observador O' (infinito - infinito)
            ctA_prime = Infinity;
            ctB_prime = Infinity;
            delta_ctau = Infinity;
        }
    } else{
        // Cálculo normal si gamma es distinto de infinito
        ctA_prime = gamma * diffA;
        ctB_prime = gamma * diffB;
        delta_ctau = ctB_prime - ctA_prime;
    }

    // Dibujamos el área entre las rectas discontinuas
    noStroke();
    fill(0, 0, 255, 30);
    beginShape();
    vertex(-300, -(v * -300 + (ctA - v * xA)));
    vertex(300, -(v * 300 + (ctA - v * xA)));
    vertex(300, -(v * 300 + (ctB - v * xB)));
    vertex(-300, -(v * -300 + (ctB - v * xB)));
    endShape(CLOSE);

    // Dibujamos las líneas discontinuas
    stroke(0, 0, 255);
    strokeWeight(1.5);
    drawingContext.setLineDash([5, 5]);

    // Línea que pasa por A: v*(x - xA) + ctA
    line(-300, -(v * (-300 - xA) + ctA), 300, -(v * (300 - xA) + ctA));

    // Línea que pasa por B: v*(x - xB) + ctB
    line(-300, -(v * (-300 - xB) + ctB), 300, -(v * (300 - xB) + ctB));

    drawingContext.setLineDash([]);

    // Dibujar la flecha de cΔτ 
    let x1P = -70;  // La ponemos a la izquierda para que no se solape con la flecha de cΔt
    let y1P = -(v * (x1P - xA) + ctA);

    // Evitamos que las posiciones espaciales de la cota se alteren si delta_ctau es 0
    let x2P, y2P;
    if(gamma === Infinity || isNaN(gamma)){
        // Si la velocidad es c, la cota se dibuja estática sobre la misma linea de simultaneidad
        x2P = x1P;
        y2P = y1P;
    } else{
        x2P = x1P + (gamma * v * delta_ctau);
        y2P = y1P - (gamma * delta_ctau);
    }

    // Color negro para las barras de la cota
    stroke(0);
    strokeWeight(2);

    // Barras
    let barSize = 12;
    // Barra A (Extremo)
    line(x1P - barSize, y1P - (barSize * -v), x1P + barSize, y1P + (barSize * -v));
    // Barra B (Extremo)
    line(x2P - barSize, y2P - (barSize * -v), x2P + barSize, y2P + (barSize * -v));

    // línea de unión (la cota que mide la diferencia de tiempo)
    line(x1P, y1P, x2P, y2P);

    // Etiqueta de cΔτ
    noStroke();
    fill(0);
    textSize(18);
    textAlign(RIGHT, CENTER);

    // Puntos medios
    xMid = (x1P + x2P) / 2;
    yMid = (y1P + y2P) / 2;

    text("cΔτ", xMid - 15, yMid);

    // Calculamos cΔτ para la tabla
    window.delta_tp = Math.abs(delta_ctau);

}

// Dibuja la dilatación temporal en el diagrama
function drawTimeDilation(v, gamma){

    if(!showTimeDilt || points.length < 2) return;

    // Forzamos al punto A estar en el origen de coordenadas
    points[0].x = 0;
    points[0].y = 0;

    // Forzamos al punto B estar en el eje ct (x = 0) para que esté alineado con A
    points[1].x = 0;

    let B = points[1];
    let ctB = B.y;

    // Calculamos B' (punto intersección entre la recta que pasa por B y el eje cτ)
    let xBp = - ctB * v * gamma;      // Coordenada espacial de B'
    let ctBp = - gamma * ctB;         // Coordenada temporal de B'

    push();

    // Dibujamos el segmento de tiempo propio (en el eje ct)
    stroke(0, 0, 255);
    strokeWeight(4);
    line(0, 0, xBp, -ctBp);

    // Dibujamos el segmento de tiempo dilatado (en el eje cτ)
    stroke(255, 0, 0);
    strokeWeight(4);
    line(0, 0, 0, B.y);

    // Punto B' y etiquetas
    fill(0, 0, 255);
    noStroke();
    ellipse(xBp, -ctBp, 8, 8);

    fill(0);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    text("B'", xBp + 12, -ctBp);

    // Etiquetas de los intervalos
    textStyle(NORMAL);
    textSize(16);
    fill(200, 0, 0);
    text("cΔt", -30, B.y / 2);
    fill(0, 0, 200);

    // Para la etiqueta de τ, la ponemos un poco desplazada del eje azul
    text("cΔτ", xBp - 20, -ctBp / 2);

    pop();
}

// Dibuja la tabla de valores correspondiente a la dilatación temporal
function drawTimeDilationTable(v, gamma){

    // Solo mostrar la tabla cuando el botón de dilatación esté encendido y haya 2 puntos dibujados
    if(!showTimeDilt || points.length < 2) return;

    // Tiempo propio 
    let B = points[1];
    let delta_t = Math.abs(B.y);    // Valor absoluto del tiempo medido en ct

    // Tiempo diltado
    // Aplicamos la fórmula Δτ = γ · Δt
    let delta_tp = delta_t * gamma;

    push();
    resetMatrix();

    // Posición y dimensiones de la tabla en la página
    let x = 0;
    let y = 350;
    let col1 = 80;
    let col2 = 80;
    let rowH = 40;

    stroke(0);
    strokeWeight(1);
    fill(240);

    // Encabezado 
    rect(x, y, col1 + col2, rowH);

    noStroke();
    fill(0);
    textStyle(BOLD);    // Texto en negritas
    textAlign(CENTER, CENTER);      // Texto centrado
    text("Dilatación T.", x + (col1 + col2) / 2, y + rowH / 2);
    textStyle(NORMAL);

    stroke(0);
    strokeWeight(1);

    // Fila 1 --> tiempo propio
    fill(255, 230, 230);                    // Fondo rojo
    rect(x, y + rowH, col1, rowH);
    rect(x + col1, y + rowH, col2, rowH);

    // Columna 1 (etiqueta de tiempo propio)
    fill(0);    
    textAlign(LEFT, CENTER);
    text("cΔt (P)", x + 10, y + rowH + rowH / 2);

    // Columna 2
    textAlign(RIGHT, CENTER);
    text(nf(delta_t, 1, 0), x + col1 + col2 - 10, y + rowH + rowH / 2);

    // Fila 2 --> tiempo dilatado
    fill(230, 230, 255);                    // Fondo azul
    rect(x, y + 2*rowH, col1, rowH);
    rect(x + col1, y + 2*rowH, col2, rowH);

    // Columna 1 (etiqueta de tiempo dilatado)
    fill(0);    
    textAlign(LEFT, CENTER);
    text("cΔτ (D)", x + 10, y + 2*rowH + rowH / 2);

    // Columna 2 (Valor)
    textAlign(RIGHT, CENTER);
    text(nf(delta_tp, 1, 0), x + col1 + col2 - 10, y + 2*rowH + rowH / 2);

    pop();

}

// Dibuja la contracción de longitudes
function drawLengthContraction(v, gamma){

    // La contracción de longitudes sólo funciona si ya hay 2 puntos dibujados
    if(!showLengthCont || points.length < 2) return;

    // Puntos A y B
    let A = points[0];
    let B = points[1];

    B.y = A.y - v * (B.x - A.x);

    // Coordenadas para cálculos
    let xA = A.x;
    let ctA = -A.y;
    let xB = B.x;
    let ctB = -B.y;

    // B' es simultáneo a A para el observador O
    let xBp = xB + v * (ctA - ctB);
    let ctBp = ctA;

    // Cálculo de L y L_0 (Proyecciones de Δx y Δx' sobre los ejes x y x' respectivamente)
    
    // L_0: Longitud de la varilla en el sistema O'
    // Usamos las transformaciones de Lorentz para calcular Δx': Δx' = gamma * (Δx - v * Δct)
    let L0_val = Math.sqrt((xB - xA)*(xB - xA) + (B.y - A.y)*(B.y - A.y));

    // L: Longitud de la varilla en el sistema O
    let L_val = Math.abs(xBp - xA);

    push();

    // Dibujar las líneas de universo (negras)
    stroke(0);
    strokeWeight(1);
    let h = 600;
    line(xA - v * h, A.y + h, xA + v * h, A.y - h);     // Recta que pasa por A
    line(xB - v * h, B.y + h, xB + v * h, B.y - h);     // Recta que pasa por B

    // Segmento L (rojo) sobre el eje x
    let startL = xA - v * ctA;  // Límite inicio
    let endL = xB - v * ctB;    // Limite fin

    stroke(255, 0, 0);     // Rojo transparente tipo marcador
    strokeWeight(6);
    line(startL, 0, endL, 0);

    // Resaltar L0 (en el eje x')
    let xProjA = (xA - v * ctA) / (1 - v*v);   
    let yProjA = -v * xProjA;               

    let xProjB = (xB - v * ctB) / (1 - v*v);
    let yProjB = -v * xProjB;

    stroke(0, 0, 255);     // Azul transparente tipo marcador
    strokeWeight(6);
    line(xProjA, yProjA, xProjB, yProjB);
    
    strokeWeight(4); 
    // Segmento Δx = AB' (Medición de la varilla hecha por el observador O) paralelo al eje x
    stroke(255, 0, 0);
    line(A.x, A.y, xBp, -ctBp);
    // Segmento Δx' = AB (Medición de la varilla hecha por el observador O') paalelo al eje x'
    stroke(0, 0, 255);
    line(A.x, A.y, B.x, B.y);

    // Dibujar el punto B'
    fill(0);
    noStroke();
    ellipse(xBp, -ctBp, 8, 8);

    // Etiqueta del punto B'
    fill(0);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    text("B'", xBp + 12, -ctBp);

    // Etiqueta de las longitudes L y L0
    textStyle(NORMAL);
    textSize(16)
    noStroke();

    // Etiqueta de L
    fill(150, 0, 0);
    text("L", (startL + endL)/ 2, 25);

    // Etiqueta de L0
    fill(0, 0, 150);
    text("L0", (xProjA + xProjB) / 2 + 15, (yProjA + yProjB) / 2 - 15);

    pop();

    window.currentL = L_val;
    window.currentL0 = L0_val;

}
   

// Dibuja la tabla de valores correspondiente a la contracción de longitudes
function drawLengthTable(){
    if(!showLengthCont || points.length < 2) return;

    let L = window.currentL || 0;
    let L0 = window.currentL0 || 0;

    push();
    resetMatrix();

    // Posición y dimensiones de la tabla
    let x = 0;          // Posición X
    let y = 350;        // Posición Y
    let col1 = 80;      // Anchura de la columna 1 (Etiquetas)
    let col2 = 80;      // Anchura de la columna 2 (Valores)
    let rowH = 40;      // Altura de las filas

    // Marco del encabezado
    stroke(0);
    strokeWeight(1);
    fill(240);
    rect(x, y, col1 + col2, rowH);

    // Encabezado 
    noStroke();
    fill(0);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("Contracción E.", x + (col1 + col2)/2, y + rowH/2);

    // Fila 1 --> Longitud L (medido por O)
    stroke(0);
    strokeWeight(1);
    fill(255, 230, 230);    // Fondo azul transparente
    rect(x, y + rowH, col1, rowH);
    rect(x + col1, y + rowH, col2, rowH);

    noStroke();
    fill(0);
    textAlign(LEFT, CENTER);
    text("L", x + 10, y + rowH + rowH/2);
    textAlign(RIGHT, CENTER);
    text(nf(L, 1, 1), x + col1 + col2 - 10, y + rowH + rowH/2);

    // Fila 2 --> Longitud L0 (medido por O')
    stroke(0);
    strokeWeight(1);
    fill(230, 230, 255);    // Fondo rojo transparente
    rect(x, y + 2*rowH, col1, rowH);
    rect(x + col1, y + 2*rowH, col2, rowH);

    // Etiqueta
    noStroke();
    fill(0);
    textAlign(LEFT, CENTER);
    text("L0", x + 10, y + 2*rowH + rowH/2);
    textAlign(RIGHT, CENTER);
    text(nf(L0, 1, 1), x + col1 + col2 - 10, y + 2*rowH + rowH/2);

    pop();
}

// Dibuja la tabla de coordenadas de los puntos dibujados en el diagrama
function drawPointsTable(v, gamma){

    // Solo se muestra la tabla si el botón de dibujar puntos está activado y
    // ya hay 2 puntos dibujados en el diagrama
    if(!showPoint || points.length !== 2) return;

    // Puntos A y B
    let A = points[0];
    let B = points[1];

    // Coordenadas de A y B del observador O
    let xA = A.x ;   // Coordenada espacial de A
    let ctA = -A.y; // Coordenada temporal de A
    let xB = B.x ;   // Coordenada espacial de B
    let ctB = -B.y ; // Coordenada temporal de B
    
    // Coordenadas de A y B respecto del observador O' (que serían A' y B')
    let xA_p = gamma * (xA - v * ctA);  // Coordenada espacial de A'
    let ctA_p = gamma * (ctA - v * xA); // Coordenada temporal de A'
    let xB_p = gamma * (xB - v * ctB);  // Coordenada espacial de B'
    let ctB_p = gamma * (ctB - v * xB); // Coordenada temporal de B'

    // Dibujar la tabla
    push();
    resetMatrix();

    // Posición y dimensiones de la tabla
    let x = 0;
    let y = 505;
    let colW = 70;
    let rowH = 40;

    stroke(0);
    strokeWeight(1);
    fill(240);

    // Encabezado
    rect(x, y, 30, rowH);
    rect(x + 30, y, colW, rowH);
    rect(x + 30 + colW, y, colW, rowH);

    // Etiquetas
    fill(0);
    textAlign(CENTER, CENTER);
    text("", x + colW/2, y + rowH/2);
    text("A", x + 30 + colW/2, y + rowH/2);
    text("B", x + 30 + colW + colW/2, y + rowH/2);

    // Fila 1 -> Observador o
    fill(255, 230, 230);    // Rojo transparente
    rect(x, y + rowH, 30, rowH);
    rect(x + 30, y + rowH, colW, rowH);
    rect(x + 30 + colW, y + rowH, colW, rowH);

    //Etiquetas
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("O", x + 30/2, y + rowH + rowH/2);
    text("(" + nf(xA, 1, 0) + "," + nf(ctA, 1, 0) + ")", x + 30 + colW/2, y + rowH + rowH/2);
    text("(" + nf(xB, 1, 0) + "," + nf(ctB, 1, 0) + ")", x + 30 + colW + colW/2, y + rowH + rowH/2);

    // Fila 2 -> Observador O'
    fill(230, 230, 255);    // Azul transparente
    rect(x, y + 2 * rowH, 30, rowH);
    rect(x + 30, y + 2 * rowH, colW, rowH);
    rect(x + 30 + colW, y + 2 * rowH, colW, rowH);

    // Etiquetas
    fill(0);
    textAlign(CENTER, CENTER);
    text("O'", x + 30 / 2, y + 2 * rowH + rowH / 2);
    // Si el factor de Lorentz tiende a infinito, entonces los puntos A' y B', que son A y B transformados
    // para el observador O', tenderán a infinito.
    let A_px = gamma === Infinity ? "∞" : nf(xA_p, 1, 0);   // Coordenada espacial de A'
    let A_py = gamma === Infinity ? "∞" : nf(ctA_p, 1, 0);  // Coordenada temporal de A'
    let B_px = gamma === Infinity ? "∞" : nf(xB_p, 1, 0);   // Coordenada espacial de B'
    let B_py = gamma === Infinity ? "∞" : nf(ctB_p, 1, 0);  // Coordenada temporal de B'
    text("(" + A_px + "," + A_py +")", x + 30 + colW/2, y + 2 * rowH + rowH/2);
    text("(" + B_px + "," + B_py +")", x + 30 + colW + colW/2, y + 2 * rowH + rowH/2);
    
    pop();
}