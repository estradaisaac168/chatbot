(function () {
    alertify.set('notifier', 'position', 'top-center');
    const formResponse = document.querySelector('#formResponse');
    const ddOption = document.querySelector('#ddOption');
    const ddQuestionNext = document.querySelector('#ddQuestionNext');
    const txtResponseArea = document.querySelector('#txtResponseArea');
    const btnResponse = document.querySelector('#btnResponse');


    formResponse.addEventListener("submit", function (event) {
        event.preventDefault();
        

        const { value: ddOptionValue } = ddOption;
        const { value: ddQuestionNextValue } = ddQuestionNext;
        const { value: txtResponseAreaValue } = txtResponseArea;

        if (!ddQuestionNext.disabled) {
            if (!ddQuestionNextValue || ddQuestionNextValue.trim() === '' || ddQuestionNextValue === 'Seleccione la pregunta como secuencia') {
                alertify.error('Seleccione una pregunta.');
                return;
            }
        }

        if (!ddOptionValue || ddOptionValue.trim() === '' || ddOptionValue === 'Seleccione una opcion') {
            alertify.error('Seleccione una opcion.');
            return;
        }

        if (txtResponseAreaValue.trim() === '' || txtResponseAreaValue.length < 3) {
            alertify.error('La Respuesta debe tener al menos 3 caracteres.');
            return;
        }

        saveResponse(formResponse);

        formResponse.reset();

        ddQuestionNext.disabled = true;

    });

    async function saveResponse(formResponse) {
        try {
            const formData = new FormData(formResponse);
            // console.log("Datos del formulario:", Object.fromEntries(formData));

            const apiUrl = 'https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/response';

            const response = await fetch(apiUrl, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });


            if (!response.ok) {
                throw new Error('Error al guardar los datos');
            }

            const data = await response.json();

            if (data.status) {

                // console.log('Respuesta del servidor',data.message);
                // return;
                alertify.success(data.message);

                // setTimeout(() => {
                //     location.reload();
                // }, 1500);
            } else {
                alertify.error(data.message);
                // console.log(data.message);
            }

        } catch (error) {
            console.log("Error: ", error);
        }
    }

    async function getOptions() {
        try {

            const apiUrl = 'https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/option/getOptionsIsNull';

            const response = await fetch(apiUrl, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            // const data = await response.json();
            return await response.json();

            // if (data.status) {
            //     const options = data.options;
            //     renderOptions(options);
            // }


        } catch (error) {
            console.error("Error al obtener los datos:", error);
        }
    }

    async function getQuestions() {
        try {

            const apiUrl = 'https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/question/';
            const response = await fetch(apiUrl, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();
            const data = await response.json();

            // if (data.status) {
            //     const options = data.options;
            //     renderOptions(options);
            // }


        } catch (error) {
            console.error("Error al obtener los datos:", error);
        }
    }

    function renderOptions(options) {

        const ddOption = document.querySelector('#ddOption');

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.id;
            optionElement.textContent = option.option_text;
            ddOption.appendChild(optionElement);
        });
    }


    function renderQuestions(questions) {

        const ddQuestionNext = document.querySelector('#ddQuestionNext');

        questions.forEach(question => {
            const optionElement = document.createElement('option');
            optionElement.value = question.id;
            optionElement.textContent = question.question_text;
            ddQuestionNext.appendChild(optionElement);
        });
    }

    async function app() {
        try {

            const result = await Promise.all([getOptions(), getQuestions()]);

            renderOptions(result[0].options);
            renderQuestions(result[1].questions);

        } catch (error) {
            console.log(error);
        }
    }

    app();


    // Config

    document.getElementById('chkDisabledNextQuestion').addEventListener('change', function () {
        document.querySelector('#ddQuestionNext').disabled = !this.checked;
        ddQuestionNext.selectedIndex = 0;
    });


})();

