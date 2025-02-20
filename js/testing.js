"use strict";

(function () {

    // ******************************************************************************

    const chatContainer = document.getElementById("chatContainer");
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");

    let initialQuestion = 2;
    let endQuestion = 4;
    let arrayResponse = [];
    let arrayResponses = [];
    let arrayQuestion = [];
    let currentResponse = [];

    let arrayDocument = [];

    // Iniciar el flujo del chatbot
    getQuestion(initialQuestion);

    /******************************************************  Fetch API *********************************** */


    // Función para obtener la pregunta y opciones desde el servidor
    async function getQuestion(questionId) {

        // currentQuestion.length = 0;

        // currentQuestion.push({
        //     id: questionId
        // });

        try {

            const urlApi = `https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/question/${questionId}`;

            const response = await fetch(urlApi, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.status) {
                fillQuestion(data);
                fillResponses(data);
                displayBotMessage(data.question.question_text);
                displayResponses(data.responses);
            } else {
                displayBotMessage(data.question)

            }

        } catch (error) {
            // alertify.error(showMessage('serverError'));
        }
    }

    async function getResponse(responseId) {

        try {

            const urlApi = `https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/response/${responseId}`;

            const response = await fetch(urlApi, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            });

            const data = await response.json();

            // return data;

            if (data.status) {

                fillResponse(data);
                displayBotMessage(data.response.response_text);
            }

        } catch (error) {
            alertify.error(showMessage('serverError'));
        }
    }


    // Generr el pdf
    async function createPDF(clave, responseId) {
        try {

            const formData = new URLSearchParams();
            formData.append("clave", clave);
            formData.append("responseId", responseId);

            const apiUrl = 'https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/document/generate';

            const response = await fetch(apiUrl, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            return await response.json();
            // const data = await response.json();

            // if (data.status) {
            //     fillDocument();
            //     // downloadPDF(data.id);
            // } else {
            //     alert('Error al generar el documento.');
            // }
        } catch (error) {
            console.error('Mensaje de error desde crear pdf', error);
            return null;
        }
    }


    async function downloadPDF(documentoId) {

        try {
            const apiUrl = `https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/document/download/${documentoId}`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            displayBotDownloadLink(url);

        } catch (error) {
            console.error('Mensaje de error desde crear pdf', error);
        }
    }

    /************************************************************************************************************* */


    function fillQuestion(data) {

        arrayQuestion.length = 0;

        arrayQuestion = structuredClone(data);

        // arrayQuestion = structuredClone(data);
    }


    function fillResponses(data) {

        arrayResponses.length = 0;

        arrayResponses = structuredClone(data.responses);

        // arrayQuestion = structuredClone(data);
    }


    function fillResponse(data) {

        arrayResponse.length = 0;

        arrayResponse = structuredClone(data.response);
    }

    function fillDocument(data) {

        arrayDocument.length = 0;

        arrayDocument = structuredClone(data);
    }


    /******************************************************  Manejar logica *********************************** */


    // Manejador seleccion del usuario
    async function handleUserSelection(opcion) {

        let next_question = getIndex(opcion, arrayResponses)?.next_question; //Obtener la next_question.
        let next_response = getIndex(opcion, arrayResponses)?.next_response; //Obtiene de la opcion la proxima pregunta.
        let type_doc = getIndex(opcion, arrayResponses)?.type_document;

        // let next_question = getIndex(opcion, arrayQuestion)?.next_question; //Obtener la next_question.
        // let next_response = getIndex(opcion, arrayQuestion)?.next_response; //Obtiene de la opcion la proxima pregunta.
        // let type_doc = getIndex(opcion, arrayQuestion)?.type_document;


        let response_text = getIndex(opcion, arrayResponses)?.response_text; //Obtener la opcion actual.
        let response_id = getIndex(opcion, arrayResponses)?.id; //Me devuelve el id de la opcion seleccionada
        let question_id = getIndex(opcion, arrayResponses)?.question_id; //Me devuelve el question_id de la opcion seleccionada

        // let response_text = getIndex(opcion, arrayQuestion)?.response_text; //Obtener la opcion actual.
        // let response_id = getIndex(opcion, arrayQuestion)?.id; //Me devuelve el id de la opcion seleccionada
        // let question_id = getIndex(opcion, arrayQuestion)?.question_id; //Me devuelve el question_id de la opcion seleccionada

        if (getIndex(opcion, arrayResponses)?.type_response === 1) {
            if (next_question && next_question !== null) { // Si hay siguiente respuesta
                console.log('Si hay una siguiente pregunta');

                displayUserMessage(response_text); //Muestra la opcion selecciona del usuario.
                clearInput(); // Limpia el input.

                await getQuestion(next_question); // Obtener el nuevo bloque de pregunta y respuestas.


            } else { // No hay siguiente respuesta entonces verificar las respuestas.
                console.log('No hay una siguiente pregunta pero si una respuesta');

                if (next_response && next_response === 1) { //Evalua que exista y que tenga una secuencia respuesta.
                    console.log('Si hay una respuesta y una secuencia');

                    displayUserMessage(response_text);
                    clearInput();

                    await getResponse(response_id);

                    do {  //Hacer mientras (Llama las respuestas mientras exista una proxima pregunta).
                        await getResponse(arrayResponse.id);
                        next_response = arrayResponse.next_response;
                        console.log(" next_response ", next_response);
                    } while (next_response === 1);


                    if (arrayResponse.next_question && arrayResponse.next_question !== null) {
                        await getQuestion(arrayResponse.next_question);
                    }

                } else {
                    console.log('No hay proxima pregunta pero Si hay una respuesta y no secuencia');

                }

            }
        }


        if (getIndex(opcion, arrayResponses)?.type_response === 2) {
            if (next_question && next_question !== null) {  //Si no es null llamar a la siguiente pregunta.
                console.log('Hay next question');
                displayUserMessage(response_text); //Muestra la opcion selecciona del usuario.
                clearInput();
                await getQuestion(next_question); // Obtener el nuevo bloque de pregunta y respuestas.

            } else { //Si es null llamar a la respuesta. //Imprimir documento

                if (next_response && next_response === 1) {  //Si hay siguiente respuesta
                    console.log('No hay next question pero Hay proxima respuesta');

                    displayUserMessage(response_text);
                    clearInput();

                    // Mostrar Secuencia de la respuesta
                    do {  //Hacer mientras (Llama las respuestas mientras exista una proxima pregunta).
                        await getResponse(response_id);
                        next_response = arrayResponse.next_response;
                    } while (next_response === 1);

                    const response = await createPDF(type_doc, response_id);

                    fillDocument(response);



                    if (arrayDocument.status) {
                        console.log("Proxima pregunta");
                        await getQuestion(arrayResponse.next_question);
                    } else {
                        displayBotMessage("No se pudo generar tu documento");
                    }

                    // if (type_doc && type_doc === 2) { // Segun el tipo de documento a imprimir
                    //     console.log('tipo de documento: ', type_doc);

                    //     // Mostrar Secuencia de la respuesta
                    //     do {  //Hacer mientras (Llama las respuestas mientras exista una proxima pregunta).
                    //         await getResponse(response_id);
                    //         next_response = arrayResponse.next_response;
                    //     } while (next_response === 1);

                    //     await createPDF(type_doc, response_id);

                    //     console.log(type_doc, response_id);

                    //     console.log(arrayResponse.next_question);
                    //     console.log('question', next_question);
                    //     console.log('response', next_response);
                    //     console.log('arrayDocument', arrayDocument);

                    //     if (response.status) {
                    //         console.log("Proxima pregunta");
                    //         // await getQuestion(arrayResponse.next_question);
                    //     } else {
                    //         displayBotMessage("No se pudo generar tu documento");
                    //     }

                    // }

                } else { // Si no hay respuesta siguiente
                    console.log('No hay next question  y No hay proxima respuesta');
                    // displayUserMessage(response_text);
                    console.log('arrayDocument', arrayDocument);
                    if (response_text === 'Descargar') {
                        // await getResponse(null);
                        displayUserMessage(response_text);
                        await downloadPDF(arrayDocument.id);
                        await getQuestion(endQuestion);
                    } else {
                        displayUserMessage(response_text);
                        clearInput();
                        console.log('Mandar por correo');
                        return;
                    }
                }
            }
        }



        // if (getIndex(opcion, arrayQuestion)?.type_response === 1) { // Solamente para tipo normal
        //     if (next_question && next_question !== null) {  //Si no es null llamar a la siguiente pregunta.

        //         displayUserMessage(response_text); //Muestra la opcion selecciona del usuario.
        //         clearInput();
        //         await getQuestion(next_question); // Obtener el nuevo bloque de pregunta y respuestas.

        //     } else { //Si es null llamar a la respuesta.

        //         // let next_question = getIndex(opcion, arrayQuestion)?.next_question;
        //         // let next_response = getIndex(opcion, arrayQuestion)?.next_response; //Obtiene de la opcion la proxima pregunta.
        //         // let response_id = getIndex(opcion, arrayQuestion)?.id; //Obtiene el indice y luego el id de ese indice.

        //         if (next_response && next_response === 1) { //Evalua que exista y que tenga una secuencia respuesta.

        //             let response_text = getIndex(opcion, arrayQuestion)?.response_text;  //Obtiene el texto de la repuesta actual.
        //             displayUserMessage(response_text);  //Imprime por mensaje el texto que selecciono el usuario.

        //             const response = await getResponse(response_id);  // Se manda a llamar la proxima respuesta.

        //             arrayResponse = [response.document];

        //             displayBotMessage(arrayResponse[0].response_text);

        //             clearInput();  //Limpia el input de lo que ingreso el usuario.

        //             do {  //Hacer mientras (Llama las respuestas mientras exista una proxima pregunta).
        //                 const response = await getResponse(arrayResponse[0].id);
        //                 arrayResponse = [response.document];
        //                 if (arrayResponse) displayBotMessage(arrayResponse[0].response_text);
        //                 next_response = arrayResponse.next_response;
        //                 console.log(" next_response ", next_response);
        //             } while (next_response === 1);



        //             console.log(" Next question? ", arrayResponse[0].next_question);
        //             if (arrayResponse[0].next_question && arrayResponse[0].next_question !== null) {

        //                 await getQuestion(arrayResponse[0].next_question);
        //             }
        //         } else {
        //             console.log("No tiene secuencia de respuesta");
        //             await getResponse(response_id);  // Se manda a llamar la proxima respuesta.
        //             clearInput();

        //             console.log(next_question);

        //             if (next_question && next_question !== null) {
        //                 await getQuestion(next_question);
        //             }
        //         }

        //     }
        // }




    }


    sendButton.addEventListener("click", function () {

        const opcion = userInput.value.trim(); //Numero ingresado por el usuario

        if (checkIndex(opcion, arrayResponses)) { //Chequea si existe el indice en el array segun la opcion que selecciono el usuario.

            handleUserSelection(opcion); // Llama al manejador que tiene la logica de como interactua el usuario con las preguntas.

        } else { //Si no existe manda un mensaje e imprime nuevamente las opciones disponibles.
            displayUserMessage(`Opcion ${opcion}`); // Imprime la seleccion del usuario
            displayBotMessage(`Selecciona una de las opcones en la lista`); //Mensaje de alerta sobre seleccionar la opcion correcta.
            clearInput(); // Limpia el input de lo ingreso el usuario.

            displayResponses(arrayQuestion.responses.filter(option => option.question_id === arrayQuestion.question.id));
        }

    });

    /******************************************************  Mostrar la informacion en el chat *********************************** */


    function displayBotMessage(message) {
        const botMessage = document.createElement("div");
        botMessage.className = "bot-message d-flex flex-column align-items-start";

        const timeNode = document.createElement("span");
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeNode.textContent = currentTime;
        timeNode.classList.add("text-muted", "small", "mb-1");
        const messageContainer = document.createElement("div");
        messageContainer.className = "d-flex align-items-center";

        const icon = document.createElement("i");
        icon.classList.add("bi", "bi-robot", "me-2");

        const textNode = document.createElement("span");
        textNode.textContent = message;

        messageContainer.appendChild(icon);
        messageContainer.appendChild(textNode);

        botMessage.appendChild(timeNode);
        botMessage.appendChild(messageContainer);
        chatContainer.appendChild(botMessage);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }


    function displayResponses(responses) {
        let increment = 1;
        responses.forEach(response => {
            const optionText = `${increment} - ${response.response_text}`;
            const botMessage = document.createElement("div");
            botMessage.textContent = optionText;
            botMessage.className = "bot-message";
            chatContainer.appendChild(botMessage);
            increment++;

        });
    }


    function displayUserMessage(message) {
        const userMessage = document.createElement("div");
        userMessage.className = "user-message d-flex flex-column align-items-end";  // Cambié 'd-flex' por 'flex-column' para apilar los elementos

        const timeNode = document.createElement("span");
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeNode.textContent = currentTime;
        timeNode.classList.add("text-muted", "small");

        const messageContainer = document.createElement("div");
        messageContainer.className = "d-flex align-items-center";  // Para alinear el icono junto al mensaje

        const textNode = document.createElement("span");
        textNode.textContent = message;

        const icon = document.createElement("i");
        icon.classList.add("bi", "bi-person-circle", "ms-2");

        messageContainer.appendChild(textNode);
        messageContainer.appendChild(icon);

        userMessage.appendChild(timeNode);
        userMessage.appendChild(messageContainer);

        chatContainer.appendChild(userMessage);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function displayBotDownloadLink(url, filename = "documento pdf") {
        const botMessage = document.createElement("div");
        botMessage.className = "bot-message d-flex flex-column align-items-start";

        // Agregar la hora
        const timeNode = document.createElement("span");
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeNode.textContent = currentTime;
        timeNode.classList.add("text-muted", "small", "mb-1");

        // Contenedor del mensaje
        const messageContainer = document.createElement("div");
        messageContainer.className = "d-flex align-items-center";

        // Ícono del bot
        const icon = document.createElement("i");
        icon.classList.add("bi", "bi-robot", "me-2");

        // Crear enlace de descarga
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.textContent = `Descargar ${filename}`;
        link.classList.add("btn", "btn-link"); // Agregar estilos Bootstrap

        // Ensamblar el mensaje
        messageContainer.appendChild(icon);
        messageContainer.appendChild(link);
        botMessage.appendChild(timeNode);
        botMessage.appendChild(messageContainer);

        // Agregar al contenedor del chat
        chatContainer.appendChild(botMessage);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }


    //Chequear si existe el index en el arreglo
    function checkIndex(input, array) {
        const index = parseInt(input - 1, 10);
        return !isNaN(index) && index >= 0 && index < array.length;
    }

    function getIndex(input, array) {
        return array[input - 1];
    }


    function clearInput() {
        document.querySelector('#userInput').value = '';
    }


    function imprimirArray(array) {
        if (array.length === 0) {
            console.log("El array está vacío.");
            return;
        }

        console.log("Contenido del array:");
        array.forEach((elemento, index) => {
            console.log(`Índice ${index}:`, elemento);
        });
    }

    function showMessage(messageKey) {
        if (Messages.hasOwnProperty(messageKey)) {
            alertify.warning(Messages[messageKey]);
        }
    }

    function checkArray(data) {
        return Array.isArray(data) && data.length > 0;
    }

    function checkInput(input) {
        return input !== "" && !isNaN(input) && Number.isFinite(Number(input))
    }

    // **************************************************************************************

})();