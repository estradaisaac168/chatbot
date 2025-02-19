const Validator = {
    validateInput: function(input, errorText, minLength = 3, maxLength = 20) {
        // Verificar si el valor está vacío
        if (!input.value.trim()) {
            return { isValid: false, message: 'Debes agregar una opcion' };
        }
    
        // // Verificar si tiene espacios al principio o al final
        if (input.value !== input.value.trim()) {
            return { isValid: false, message: 'El campo tiene espacios al principio o al final.' };
        }
    
        // // Verificar longitud mínima
        if (input.value.length < minLength) {
            return { isValid: false, message: `El campo debe tener al menos ${minLength} caracteres.`};
        }
    
        // // Verificar longitud máxima
        if (input.value.length > maxLength) {
            return { isValid: false, message: `El campo no debe tener más de ${maxLength} caracteres.`};
        }

        return true;
    },
    validateSelect: function(selectElement) {
        // if (!selectElement || !selectElement.value) {
        //     console.error('El elemento select no es válido.');
        //     return false;
        // }
    
        // if (selectElement.value === '') {
        //     console.error(`Debe seleccionar una opción en "${selectElement.name}".`);
        //     return false;
        // }
    
        // console.log(`El valor seleccionado "${selectElement.value}" es válido.`);
        return true;
    }
};