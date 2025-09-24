
function isValidEmail(email:string) {
  const re = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return re.test(email);
}


console.log(isValidEmail("ibrahimhalil0077sezgin@gmail.com"))