import * as yup from 'yup';

export const contactSchema = yup.object().shape({
  name: yup
    .string()
    .required('El nombre es obligatorio')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras, espacios y tildes son permitidos'),
  phone: yup
    .string()
    .required('El número es obligatorio')
    .matches(/^[0-9]{10,15}$/, 'Número inválido (debe tener entre 10 y 15 dígitos)'),
});
