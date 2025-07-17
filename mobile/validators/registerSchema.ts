import * as yup from 'yup';

export const registerSchema = yup.object().shape({
  name: yup.string().required('El nombre es obligatorio').matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras, espacios y tildes son permitidos'),
  email: yup.string().email('Correo inválido').trim().required('El correo es obligatorio'),
  phone: yup.string().matches(/^[0-9]{10,15}$/, 'Número inválido').required('El número es obligatorio'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').matches(/^[a-zA-Z0-9]+$/, 'Sin caracteres especiales'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});
