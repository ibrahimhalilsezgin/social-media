/**
 * @param {string} cookieName
 * @returns
 */
export const getCookie = (cookieName:string) => {
  const name = cookieName + '='
  const decodedCookie = decodeURIComponent(document.cookie)
  const splitCookie = decodedCookie.split(';')

  for (let i = 0; i < splitCookie.length; i++) {
    let c = splitCookie[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1)
    }

    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }

  return
}

/**
 * @param {string} cookieName
 * @param {string} cookieValue
 * @param {number} expiresDay
 */
export const setCookie = (cookieName:string, cookieValue:string, expiresDay = 1) => {
  const date = new Date()
  date.setTime(date.getTime() + expiresDay * 24 * 60 * 60 * 1000)
  const expires = 'expires=' + date.toUTCString()
  document.cookie = `${cookieName}=${cookieValue};${expires};path=/`
}