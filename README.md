# One-Time (Single Use) Password Authentication Strategy using a JSON Web Token (JWT) and Cookies.


## Using

- Node
- Express
- JSON Web Tokens (JWTs)
- Sequelize (Mysql or Postgres)
- Passport
- Nodemailer (Using a SMTP Server)


## What is this?

This boilerplate code is a web app auth strategy that generates a one-time-use password that is emailed to a user. Upon login, the password is discarded and all further auth is done with a JSON Web Token (JWT) stored in a cookie on the client. 

Cookies must be enabled by the users browser for this auth scheme to work. The only thing stored in the cookie is a JWT.

JWT's can be used forever to login, or until it is expired. There is [no simple way to log out](https://medium.com/devgorilla/how-to-log-out-when-using-jwt-a8c7823e8a6) when using a JWT for auth, as they are stateless and stored on the client. One method of "logging out" the user is to clear cookies. You may want to set cookie Max-Age, Domain, and [other settings](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) to your preference.

See the nodemailer docs on [SMTP Transport](https://nodemailer.com/smtp/) and [Other Transports](https://nodemailer.com/transports/) for more info on mailservers.

Notion.so uses a similar login-flow that this code is unabashadly inspired by.


## Summary of login flow

1. User visits web app and submits their email via login form at `/register`
1. DB inserts new row using the UNIQUE email in a USER Table. Otherwise, select the user if the email exists.
1. Server generates a password and updates the PASSWORD column of the user row
1. Server adds a JWT to the clients cookie using the user ID and the password as payload
1. Server sends the user an email with the password
1. User enters the password at `/login`
1. Assuming the user didn't clear their cookies since requesting a password, the server uses the password and ID from the JWT to authenticates the user against the password they submitted
1. DB deletes one-time password from USER row
1. If authenticated, a new JWT is created with the user ID, and is replaced in the cookie.
1. User is now authenticated. The JWT from the cookie is used to auth future requests.
1. To log out, server clears the clients cookie. 


## Endpoints in this demo

- GET `/` public root
- POST `/register` Post form w/email field
- POST `/login` Post form w/password field
- GET `/login` The default redirect if user is authenticated
- POST `/logout` Clear cookies to "log out"
- GET `/protected` A demo of protected route that resolves if user is authenticated


### Suggestions and TODO

- Config cookie Max-Age, Domain, and etc based on your needs



## To Use

1. `npm install`
1. copy `.env.sample` to `.env` and add your settings
1. If you have nodemon installed, `npm run start`, otherwise `node server.js`


## Refs

- https://jwt.io/
- https://auth0.com/learn/json-web-tokens/
- https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/
- https://codesquery.com/build-secure-nodejs-rest-api-using-json-web-token/
- https://medium.com/@ryanchenkie_40935/react-authentication-how-to-store-jwt-in-a-cookie-346519310e81
- https://medium.com/devgorilla/how-to-log-out-when-using-jwt-a8c7823e8a6
- https://medium.com/devc-kano/basics-of-authentication-using-passport-and-jwt-with-sequelize-and-mysql-database-748e09d01bab
- https://medium.com/@ryanchenkie_40935/react-authentication-how-to-store-jwt-in-a-cookie-346519310e81
- https://medium.com/@piraveenaparalogarajah/sessions-and-cookies-2c0919552f29
