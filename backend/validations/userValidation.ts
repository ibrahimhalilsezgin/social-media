import { body } from "express-validator";


export const createAccountValidation = [
    body('username')
    .notEmpty().withMessage('Kullanıcı adı boş bırakılamaz.')
    .isLength({min:3}).withMessage('Kullanıcı adınız minimum 3 maksimum 32 karakter uzunluğunda olmalıdır.'),
    body('email')
    .notEmpty().withMessage('E-Posta adresi boş bırakılamaz.')
    .isEmail().withMessage('Geçerli bir e-posta adresi giriniz.'),
    body('password')
    .notEmpty().withMessage('Şifre boş bırakılamaz')
    .isStrongPassword()
    .isLength({min:6})
];
export const signInValidation = [
    body('input')
    .notEmpty()
    .withMessage('Tüm boşluklar doldurulmalıdır'),
    body('password')
    .notEmpty()
    .withMessage('Tüm boşluklar doldurulmalıdır'),
]