(function () {
    alertify.set('notifier', 'position', 'top-center');
    const formQuestion = document.querySelector('#formQuestion');
    const ddParentQuestion = document.querySelector('#ddParentQuestion');
    const txtQuestion = document.querySelector('#txtQuestion');
    const chkDisabledParentQuestion = document.querySelector('#chkDisabledParentQuestion');
    const chkIsRoot = document.querySelector('#chkIsRoot');
    const btnQuestion = document.querySelector('#saveQuestion');

    formQuestion.addEventListener("submit", async function (event) {
        event.preventDefault();


        const { value: ddParentQuestionValue } = ddParentQuestion;
        const { value: txtQuestionValue } = txtQuestion;
        const { value: chkDisabledParentQuestionValue } = chkDisabledParentQuestion;
        const { value: chkIsRootValue } = chkIsRoot;

        if (!ddParentQuestion.disabled) { //Si esta habilitado
            if (!ddParentQuestionValue || ddParentQuestionValue.trim() === '' || ddParentQuestionValue === 'Pregunta padre') {
                alertify.error('Seleccione una pregunta.');
                return;
            }
        }


        if (txtQuestionValue.trim() === '' || txtQuestionValue.length < 3) {
            alertify.error('La pregunta debe tener al menos 3 caracteres.');
            return;
        }

        await saveQuestion(this);

        formQuestion.reset();

        ddParentQuestion.disabled = true;
        chkDisabledParentQuestion.disabled = false;

    });


    async function saveQuestion(formQuestion) {


        try {

            const apiUrl = 'https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/question/save';


            const formData = new FormData(formQuestion);

            for (let pair of formData.entries()) {
                console.table(pair[0] + ': ' + pair[1]);
            }

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
                console.info(data);
                // return;
                alertify.success(data.message);

                // inputQuestion.value = '';

                // setTimeout(() => {
                //     location.reload();
                // }, 1500);
            } else {
                alertify.error(data.message);
            }



        } catch (error) {
            // alertify.error(error);
            console.error('Error:', error.message);
        }
    }

    // // Consultar
    async function getQuestions() {
        try {

            const apiUrl = 'https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/question';

            const response = await fetch(apiUrl, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (data.status) {
                const questions = data.questions;
                renderQuestions(questions);
            }


        } catch (error) {
            console.error("Error al obtener los datos:", error);
        }
    }





    function renderQuestions(questions) {

        //const selectQuestion = document.querySelector('#selectQuestion');

        questions.forEach(question => {
            const optionElement = document.createElement('option');
            optionElement.value = question.id;
            optionElement.textContent = question.question_text;
            ddParentQuestion.appendChild(optionElement);
        });
    }


    getQuestions();


    // Config

    document.querySelector('#chkDisabledParentQuestion').addEventListener('change', function () {
        ddParentQuestion.disabled = !this.checked;
    });

    document.querySelector('#chkIsRoot').addEventListener('change', function () {
        if (this.checked) {
            chkDisabledParentQuestion.disabled = true;
            chkDisabledParentQuestion.checked = false;
            ddParentQuestion.disabled = true;
        } else {
            chkDisabledParentQuestion.disabled = false;
            chkIsRoot.checked = false;
        }
    });


})();

