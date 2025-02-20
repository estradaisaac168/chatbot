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
    // let currentTypeDoc = [];

    let arrayDocument = [];

    // Iniciar el flujo del chatbot
    getQuestion(initialQuestion);

    const type_document = {
        currentValue: 0
    }

    /******************************************************  Fetch API *********************************** */


    async function getQuestion(questionId) { // Función para obtener la pregunta y opciones desde el servidor

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

    async function getResponse(responseId) { // Funcion para obtener la respuesta del usuario.

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


    async function createPDF(type, responseId) { // Funcion para crear el PDF
        try {

            const formData = new URLSearchParams();
            formData.append("type", type);
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


    async function downloadPDF(documentoId) { // Funcion para descargar el pdf.

        try {
            const apiUrl = `https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/document/download/${documentoId}`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            });

            const blob = await response.blob();

            // const url = window.URL.createObjectURL(blob);

            return window.URL.createObjectURL(blob);

        } catch (error) {
            console.error('Mensaje de error desde crear pdf', error);
            // return null;
        }
    }


    async function sendEmail(documentoId) { // Función para obtener la pregunta y opciones desde el servidor

        try {

            const urlApi = `https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/document/send/${documentoId}`;

            const response = await fetch(urlApi, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            });

            return await response.json();

        } catch (error) {
            return null;
            // alertify.error(showMessage('serverError'));
        }
    }

    /*************************************************** Utilidades  ********************************************************** */


    function fillQuestion(data) { // Llena el arrayQuestion con la pregunta actual y las respuestas que pertenecen a la pregunta.
        arrayQuestion.length = 0;
        arrayQuestion = structuredClone(data);
    }


    function fillResponses(data) { // Llena el arrayResponses con las preguntas de la respuesta actual con el fin de separar las respuestas para acceder mas facilmente.
        arrayResponses.length = 0;
        arrayResponses = structuredClone(data.responses);
    }


    function fillResponse(data) { // Llena el arrayResponse con la respuesta actual obtenida de getReponse();
        arrayResponse.length = 0;
        arrayResponse = structuredClone(data.response);
    }

    function fillDocument(data) { // Llena el arrayDocument con el id del documento recien generado para poder acceder a este.
        arrayDocument.length = 0;
        arrayDocument = structuredClone(data);
    }



    function updateTypeDoc(newValue) {
        if (newValue !== null) {
            type_document.currentValue = newValue;
        }
    }

    const dictionaryTypesDocuments = new Map([
        [1, "Constancia Salarial"],
        [2, "Boleta de pago"],
        [3, "Constancia de trabajo"]

    ]);


    /******************************************************  Manejar logica *********************************** */



    async function handleUserSelection(opcion) { // Manejador seleccion del usuario

        let next_question = getIndex(opcion, arrayResponses)?.next_question; //Obtener la next_question.
        let parent_response = getIndex(opcion, arrayResponses)?.parent_response; //Obtiene de la opcion la proxima pregunta 0 || 1.
        let next_response = getIndex(opcion, arrayResponses)?.next_response; //Obtiene el id la proxima pregunta.
        let type_doc = getIndex(opcion, arrayResponses)?.type_document;
        let type_response = getIndex(opcion, arrayResponses)?.type_response;

        let response_text = getIndex(opcion, arrayResponses)?.response_text; //Obtener la opcion actual.
        let response_id = getIndex(opcion, arrayResponses)?.id; //Me devuelve el id de la opcion seleccionada
        let question_id = getIndex(opcion, arrayResponses)?.question_id; //Me devuelve el question_id de la opcion seleccionada

        if (type_doc !== null) { // Si type_doc es numero dejar pasar.
            updateTypeDoc(type_doc);
        }



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

                    if (arrayResponse.next_response !== null) {

                        do {  //Hacer mientras (Llama las respuestas mientras exista una proxima pregunta).
                            await getResponse(arrayResponse.id);
                            next_response = arrayResponse.next_response;
                            console.log(" next_response ", next_response);
                        } while (next_response === 1);
                    } else {
                        console.log("Ha habido un error aca: Si hay una respuesta y una secuencia");
                    }

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

                    console.log('type_document.currentValue: ', type_document.currentValue, "type_doc: ", type_doc);
                    if (type_document.currentValue > 0) {
                        const response = await createPDF(type_document.currentValue, response_id);
                        fillDocument(response);
                    }

                    // const response = await createPDF(type_doc, response_id);

                    // fillDocument(response);



                    if (arrayDocument.status) {
                        console.log("Proxima pregunta");
                        await getQuestion(arrayResponse.next_question);
                    } else {
                        displayBotMessage("No se pudo generar tu documento");

                        await getQuestion(endQuestion); //Quitar............................ para mientras
                    }

                } else { // Si no hay respuesta siguiente
                    console.log('No hay next question  y No hay proxima respuesta');
                    // displayUserMessage(response_text);
                    console.log('arrayDocument', arrayDocument);
                    if (response_text === 'Descargar') {
                        // await getResponse(null);
                        displayUserMessage(response_text);
                        clearInput();
                        // await downloadPDF(arrayDocument.id);
                        const url = await downloadPDF(arrayDocument.id); // Imprime el nombre del documento?

                        console.log('type_document.currentValue: ', type_document.currentValue, "type_doc: ", type_doc);
                        if (dictionaryTypesDocuments.has(type_document.currentValue)) {
                            displayBotDownloadLink(url, dictionaryTypesDocuments.get(type_document.currentValue));
                        }

                        await getQuestion(endQuestion);
                    } else {
                        displayUserMessage(response_text);
                        clearInput();
                        console.log('Mandar por correo');
                        if (type_document.currentValue > 0) {
                            const response = await sendEmail(arrayDocument.id); //Este es el id de la respuesta como tal..
                            displayBotMessage(response.message);
                            await getQuestion(endQuestion);
                        }
                        return;
                    }
                }
            }
        }





        // if (type_response === 1 || type_response === null) {

        //     if (next_question && next_question !== null) { // Si hay siguiente respuesta

        //         console.log('Si hay una siguiente pregunta', next_question);
        //         displayUserMessage(response_text); //Muestra la opcion selecciona del usuario.
        //         clearInput(); // Limpia el input.
        //         if (next_question && next_question !== null) {
        //             await getQuestion(next_question); // Obtener el nuevo bloque de pregunta y respuestas.
        //         }

        //     } else { // No hay siguiente respuesta entonces verificar las respuestas.

        //         console.log('No hay una siguiente pregunta pero si una respuesta-> ', 'parent_response', parent_response, 'next_response', next_response);
        //         if (parent_response && parent_response === 1) { //Evalua que exista y que tenga una secuencia respuesta.


        //             console.log('Si hay una respuesta y una secuencia-> ', 'parent_response', parent_response, 'response_text: ', response_text);
        //             displayUserMessage(response_text);
        //             clearInput();

        //             await getResponse(next_response);

        //             if (arrayResponse.next_response && arrayResponse.next_response !== null) {

        //                 do {  //Hacer mientras (Llama las respuestas mientras exista una proxima pregunta).
        //                     await getResponse(arrayResponse.next_response);
        //                     parent_response = arrayResponse.parent_response;
        //                     console.log(" parent_response ", parent_response);
        //                 } while (parent_response === 1);
        //             }


        //             if (arrayResponse.next_question && arrayResponse.next_question !== null) {
        //                 await getQuestion(arrayResponse.next_question);
        //             }

        //         } else {
        //             console.log('No hay proxima pregunta pero Si hay una respuesta sin secunecia secuencia');

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
        icon.classList.add("bi", "bi-robot", "me-2", "align-self-start");

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

    function displayBotDownloadLink(url, filename = "document.pdf") {
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