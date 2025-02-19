(function () {
    alertify.set('notifier', 'position', 'top-center');
    // Inputs
    const txtOption = document.querySelector('#txtOption');
    const txtOptionDocumentName = document.querySelector('#txtOptionDocumentName');
    const txtFileOptionDocument = document.querySelector('#txtFileOptionDocument');

    // Select
    const ddType = document.querySelector('#ddType');
    const ddQuestion = document.querySelector('#ddQuestion');
    const ddQuestionNext = document.querySelector('#ddQuestionNext');

    const formOption = document.querySelector('#formOption');

    formOption.addEventListener("submit", function (event) {
        event.preventDefault();


        const { value: txtOptionValue } = txtOption;
        const { value: txtOptionDocumentNameValue } = txtOptionDocumentName;
        const { value: txtFileOptionDocumentValue } = txtFileOptionDocument;
        const { value: ddTypeValue } = ddType;
        const { value: ddQuestionValue } = ddQuestion;
        const { value: ddQuestionNextValue } = ddQuestionNext;


        if (!ddTypeValue || ddTypeValue.trim() === '') {
            alertify.error('Seleccione un tipo de opcion.');
            return;
        }

        if (txtOptionValue.trim() === '' || txtOptionValue.length < 3) {
            alertify.error('La Opcion debe tener al menos 3 caracteres.');
            return;
        }


        if (!ddQuestionValue || ddQuestionValue.trim() === '' || ddQuestionValue === 'No hay datos por mostrar') {
            alertify.error('Seleccione una pregunta.');
            return;
        }


        if (!txtOptionDocumentName.disabled && !txtFileOptionDocument.disabled) {

            if (txtOptionDocumentNameValue.trim() === '' || txtOptionDocumentNameValue.length < 3) {
                alertify.error('El nombre del documento debe tener al menos 3 caracteres.');
                return;
            }


            if (txtFileOptionDocumentValue.trim() === '' || txtFileOptionDocumentValue.length < 3) {
                alertify.error('El file del documento debe tener al menos 3 caracteres.');
                return;
            }

        }

        if (!ddQuestionNext.disabled) {

            if ((!ddQuestionNextValue || ddQuestionNextValue === 'No hay datos por mostrar')) {
                alertify.error('Debes seleccionar una pregunta como secuencia');
                return;
            }
        }

        saveOptionn(formOption);

        formOption.reset();

        txtOptionDocumentName.disabled = true;
        txtFileOptionDocument.disabled = true;
        ddQuestionNext.disabled = true;

    });

    async function saveOptionn(formOption) {


        try {

            const dataOption = new FormData(formOption);

            const apiUrl = "https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/option";

            const response = await fetch(apiUrl, {
                method: 'POST',
                credentials: 'include',
                body: dataOption
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
                // console.log(data.message);
                // return;
                alertify.error(data.message);
            }

        } catch (error) {
            // alertify.error(error);
            console.error('Error:', error.message);
        }
    }


    //Obtener los tipos de opciones
    async function getTypes() {
        try {

            const apiUrl = "https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/type";

            const response = await fetch(apiUrl, {
                method: "GET",
                mode: 'cors',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error("Error al obtener los datos:", error);
        }
    }


    async function getQuestions() {
        try {

            const apiUrl = "https://3000-idx-chatbot-1739281119193.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev/question";

            const response = await fetch(apiUrl, {
                method: "GET",
                mode: 'cors',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();


        } catch (error) {
            console.error("Error al obtener los datos:", error);
        }
    }



    function renderQuestion(questions) {

        //const selectQuestion = document.querySelector('#selectQuestion');

        if (!Array.isArray(questions) || questions.length === 0) {
            const optionElement = document.createElement('option');
            optionElement.textContent = 'No hay datos por mostrar';
            ddQuestion.appendChild(optionElement);
        } else {
            questions.forEach(question => {
                const optionElement = document.createElement('option');
                optionElement.value = question.id;
                optionElement.textContent = question.question_text;
                ddQuestion.appendChild(optionElement);
            });
        }
    }


    function renderQuestionNext(questions) {

        //const selectQuestionNext = document.querySelector('#selectQuestionNext');

        if (!Array.isArray(questions) || questions.length === 0) {
            const optionElement = document.createElement('option');
            optionElement.textContent = 'No hay datos por mostrar';
            ddQuestionNext.appendChild(optionElement);
        } else {
            questions.forEach(question => {
                const optionElement = document.createElement('option');
                optionElement.value = question.id;
                optionElement.textContent = question.question_text;
                ddQuestionNext.appendChild(optionElement);
            });
        }
    }


    function renderTypes(types) {

        if (!Array.isArray(types) || types.length === 0) {
            const optionElement = document.createElement('option');
            optionElement.value = 0;
            optionElement.textContent = 'No hay datos por mostrar';
            ddType.appendChild(optionElement);
        } else {
            types.forEach(type => {
                const optionElement = document.createElement('option');
                optionElement.value = type.id;
                optionElement.textContent = type.name;
                ddType.appendChild(optionElement);
            });
        }


    }

    async function app() {
        try {

            const result = await Promise.all([getQuestions(), getTypes()]);

            renderQuestion(result[0].questions);
            renderQuestionNext(result[0].questions);
            renderTypes(result[1].types);

        } catch (error) {
            console.log(error);
        }
    }

    app();



    // Config


    document.getElementById("ddType").addEventListener("change", function () {
        let selection = parseInt(this.value); // Convertir a número
        //console.log(selection);

        txtOptionDocumentName.disabled = true;
        txtFileOptionDocument.disabled = true;

        if (selection === 1) {
            txtOptionDocumentName.disabled = true;
            txtFileOptionDocument.disabled = true;

        } else if (selection === 2) {
            txtOptionDocumentName.disabled = false;
            txtFileOptionDocument.disabled = false;
        }
    });

    document.getElementById('chkDisabledQuestionNext').addEventListener('change', function () {
        document.querySelector('#ddQuestionNext').disabled = !this.checked;
        ddQuestionNext.selectedIndex = 0;
    });






























    // document.getElementById('chkDisabledOptionDocument').addEventListener('change', function () {
    //     document.querySelector('#txtOptionDocumentName').disabled = !this.checked;
    //     document.querySelector('#txtFileOptionDocument').disabled = !this.checked;
    //     // ddQuestionNext.selectedIndex = 0;
    // });


    

    // configuracion
    // radioNormal.addEventListener('change', () => {
    //     documentFileContainer.classList.remove('d-block');
    //     documentFileContainer.classList.add('d-none');
    //     txtOptionDocumentName.value = '';


    //     documentNameContainer.classList.remove('d-block');
    //     documentNameContainer.classList.add('d-none');
    //     txtFileOptionDocument.value = '';
    // });

    // radioDocument.addEventListener('change', () => {
    //     documentFileContainer.classList.remove('d-none');
    //     documentFileContainer.classList.add('d-block');
    //     txtFileOptionDocument.value = '';


    //     documentNameContainer.classList.remove('d-none');
    //     documentNameContainer.classList.add('d-block');
    //     txtOptionDocumentName.value = '';
    // });

    // document.querySelector('#checkSecuency').addEventListener('change', function () {
    //     const selectContainer = document.querySelector('#selectContainer');
    //     if (this.checked) {
    //         selectContainer.classList.add('d-block');
    //         selectContainer.classList.remove('d-none');
    //         ddQuestionNext.selectedIndex = 0;
    //     } else {
    //         selectContainer.classList.add('d-none');
    //         selectContainer.classList.remove('d-block');
    //         ddQuestionNext.selectedIndex = 0;

    //     }
    // });

    // document.querySelector('#checkDocument').addEventListener('change', function () {
    //     const documentContainer = document.querySelector('#documentContainer');
    //     if (this.checked) {
    //         documentContainer.classList.add('d-block');
    //         documentContainer.classList.remove('d-none');
    //     } else {
    //         documentContainer.classList.add('d-none');
    //         documentContainer.classList.remove('d-block');
    //     }
    // });

    // createSelect();

    // window.onload = () => {
    //     document.querySelector('#selectContainer').classList.add('d-none');
    //     //document.querySelector('#documentContainer').classList.add('d-none');
    // }

})();