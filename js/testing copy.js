(function () {

    // ******************************************************************************

    const chatContainer = document.getElementById("chatContainer");
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");

    let initialQuestion = 2;
    let finalQuestion = 16;
    let currentQuestionId = 14;
    
    let arrayOptions = [];
    let arrayResponse = [];
    let currentQuestion = [];

    // Iniciar el flujo del chatbot
    getQuestion(initialQuestion);

    /******************************************************  Fetch API *********************************** */


    // Función para obtener la pregunta y opciones desde el servidor
    async function getQuestion(questionId) {

        currentQuestion.length = 0;

        currentQuestion.push({
            id: questionId
        });

        try {

            const urlApi = `https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/question/${questionId}`;

            const response = await fetch(urlApi, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.status) {
                displayBotMessage(data.question.question_text)
                displayOptions(data.options);
            } else {
                displayBotMessage(data.question)

            }

        } catch (error) {
            // alertify.error(showMessage('serverError'));
        }
    }

    async function getResponse(optionId) {

        try {

            const urlApi = `https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/response/${optionId}`;

            const response = await fetch(urlApi, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.status) {

                fillResponse(data.response);
                displayBotMessage(data.response.response_text)
            } else {
                displayBotMessage(data.response)
            }

        } catch (error) {
            alertify.error(showMessage('serverError'));
        }
    }

    /************************************************************************************************************* */


    function fillResponse(response) {

        arrayResponse.length = 0;

        arrayResponse.push({
            responseId: response.id,
            text: response.response_text,
            optionId: response.option_id,
            next: response.next_question
        });
    }


    /******************************************************  Manejar logica *********************************** */


    // Manejador seleccion del usuario
    async function handleUserSelection(userResponse, flag) {

        if (flag) {

            displayUserMessage(`${userResponse.text}`);

            const nextQuestion = userResponse.next !== null ? parseInt(userResponse.next, 10) : 0;

            console.log(nextQuestion);
            // return;

            const optionId = parseInt(userResponse.optionId);

            if (nextQuestion === 0) {
                await getResponse(optionId);

                const selectedResponse = arrayResponse.find(item => item.optionId === optionId);
                const responseId = selectedResponse?.next;

                const nextQuestion = responseId !== null ? parseInt(responseId, 10) : 0;

                if (nextQuestion != 0) {
                    await getQuestion(nextQuestion);
                }

            } else {
                await getQuestion(nextQuestion);
            }

            userInput.value = "";

        } else {
            userResponse.forEach(message => {
                displayUserMessage(message);
            });
        }

    }


    // Evento para manejar el envío de la respuesta del usuario
    sendButton.addEventListener("click", function () {

        const input = userInput.value.trim();
        const lastId = currentQuestion[currentQuestion.length - 1]?.id; //Pregunta 

        if (checkInput(input)) {

            if (checkIndex(input)) { //Opcion correcta

                let userResponse = arrayOptions[input - 1];

                handleUserSelection(userResponse, true);

            } else { //Opcion incorrecta

                handleUserSelection([`Ingresaste ${input} y debe ser una opción dentro de la lista`], false);
                getQuestion(lastId);
                userInput.value = "";
            }

        } else {
            alertify.error('El campo esta vacio');
            userInput.value = "";
        }


        // Evaluar si existe en el arrayOpciones
        // Si no existe volver a mostrar la pregunta actual.

        // if (arrayOptions.includes(userInput.value.trim())) {
        //     // console.log(`El número ${userInput.value.trim()} está en el array.`);
        //     const userResponse = arrayOptions[userInput.value.trim() - 1];

        //     if (userResponse) {
        //         handleUserSelection(userResponse);
        //         userInput.value = "";
        //     }

        //     arrayOptions.length = 0;
        // } else {
        //     // console.log(`El número ${userInput.value.trim()} no está en el array.`);
        //     displayBotMessage("Selecciona una opcion correcta");


        // }




        // if (userResponse) {
        //     handleUserSelection(userResponse);
        //     userInput.value = "";
        // }

        // arrayOptions.length = 0;

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


    function displayOptions(options) {
        let increment = 1;
        arrayOptions.length = 0;
        options.forEach(option => {
            const optionText = `${increment} - ${option.option_text}`;
            const botMessage = document.createElement("div");
            botMessage.textContent = optionText;
            botMessage.className = "bot-message";
            chatContainer.appendChild(botMessage);
            arrayOptions.push({
                optionId: option.id,
                text: optionText,
                next: option.next_question
            });
            increment++;

        });
    }

    // Mostrar link del documento
    function displayOptionsDocument(doc) {
        const botMessage = document.createElement("div");
        const link = document.createElement("a");
        link.href = `${doc.file_path}`;
        link.textContent = doc.document_name;
        botMessage.appendChild(link);
        botMessage.className = "bot-message";
        chatContainer.appendChild(botMessage);
        chatContainer.scrollTop = chatContainer.scrollHeight;
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



    //Chequear si existe el index en el arreglo
    function checkIndex(input) {
        const index = parseInt(input - 1, 10);
        return !isNaN(index) && index >= 0 && index < arrayOptions.length;
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

    async function getDocument(optionId) {

        //console.log(questionId);

        try {

            // const formData = new FormData();
            // formData.append('option_id', optionId);

            urlApi = `https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/document/${optionId}`

            const response = await fetch(urlApi, {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.status) {
                console.log(data.message);
                displayBotMessage('Descarga el pdf desde el siguiente enlace');
                displayOptionsDocument(data.document);
            } else {
                //Captura mensaje de error en el servidor.
                console.log(data.message);
            }

        } catch (error) {
            //Error en el try/catch
            alertify.error('Mensaje de error en el servidor', error.message);
        }
    }


    // getDocument(25);

    // Función para procesar la respuesta del usuario
    // async function handleUserSelection(userResponse) {

    //     console.log(userResponse)

    //     //Data que trae el arrayOptions
    //     if (userResponse) {
    //         displayUserMessage(`${userResponse.text}`);

    //         // Aquí se obtiene el ID de la opción seleccionada (numérico)
    //         const nextQuestion = userResponse.next;
    //         const optionId = parseInt(userResponse.optionId);

    //         //Si es null ya no hay secuencia
    //         if (nextQuestion !== null) {
    //             await getQuestion(parseInt(nextQuestion));
    //         } else {
    //             await getDocument(optionId);
    //             await getQuestion(8);
    //         }

    //     }
    // }


    // const chatContainer = document.getElementById("chatContainer");
    // const userInput = document.getElementById("userInput");
    // const sendButton = document.getElementById("sendButton");

    // let currentQuestionId = 1;

    // async function getQuestion(questionId) {
    //     try {
    //         const response = await fetch('https://8080-idx-test-1738595836113.cluster-2xid2zxbenc4ixa74rpk7q7fyk.cloudworkstations.dev/chat/logica.php', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/x-www-form-urlencoded',
    //             },
    //             body: `question_id=${questionId}`
    //         });

    //         const data = await response.json();

    //         if (data.status) {
    //             displayBotMessage(data.question);
    //             displayOptions(data.options);
    //         } else {
    //             displayBotMessage(data.message || "Fin del chat.");
    //         }
    //     } catch (error) {
    //         displayBotMessage("Error en el servidor.");
    //     }
    // }

    // function displayBotMessage(message) {
    //     const botMessage = document.createElement("div");
    //     botMessage.textContent = message;
    //     botMessage.className = "bot-message";
    //     chatContainer.appendChild(botMessage);
    //     chatContainer.scrollTop = chatContainer.scrollHeight;
    // }

    // function displayOptions(options) {
    //     // Mostrar las opciones como mensajes, no como botones
    //     options.forEach(option => {
    //         const optionMessage = document.createElement("div");
    //         optionMessage.textContent = `${option.id}. ${option.option_text}`;
    //         optionMessage.className = "bot-message";
    //         chatContainer.appendChild(optionMessage);
    //     });
    // }

    // function handleUserSelection(userText) {
    //     // Aquí asumimos que el usuario escribe el número de la opción seleccionada
    //     const optionId = parseInt(userText.trim(), 10);

    //     if (isNaN(optionId)) {
    //         displayBotMessage("Por favor, ingresa un número válido.");
    //         return;
    //     }

    //     displayUserMessage(userText);
    //     currentQuestionId = optionId;
    //     clearOptions();
    //     getQuestion(optionId);
    // }

    // function displayUserMessage(message) {
    //     const userMessage = document.createElement("div");
    //     userMessage.textContent = message;
    //     userMessage.className = "user-message";
    //     chatContainer.appendChild(userMessage);
    //     chatContainer.scrollTop = chatContainer.scrollHeight;
    // }

    // function clearOptions() {
    //     const messages = document.querySelectorAll(".bot-message");
    //     messages.forEach(message => message.remove());
    // }

    // sendButton.addEventListener("click", function () {
    //     const userResponse = userInput.value.trim();
    //     if (userResponse) {
    //         handleUserSelection(userResponse);
    //         userInput.value = "";
    //     }
    // });

    // // Iniciar el flujo del chatbot
    // getQuestion(currentQuestionId);
})();