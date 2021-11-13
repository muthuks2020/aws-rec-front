export const requestHeadersWithJWT = {
    'Content-Type': 'application/json',
    'Authorization' : localStorage.getItem("jwt-token")
};