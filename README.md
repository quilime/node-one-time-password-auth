# One-Time (Single Use) Password Authentication Strategy using JSON Web Tokens and Client-side Cookies.


## Using

- Node
- Express
- JSON Web Tokens (JWTs)
- Sequelize (Mysql or Postgres)
- Passport
- Nodemailer (Using a SMTP Server)


## What is this?

This boilerplate code is a web app authentication strategy of using a one-time password that is emailed to a user, upon using the password it is discarded and all further auth is done with a JSON Web Token (JSW) stored in a cookie on the client. 

For testing I used a SMTP mailserver run on Dreamhost. See the nodemailer docs on [SMTP Transport](https://nodemailer.com/smtp/) and [Other Transports](https://nodemailer.com/transports/) for more info on mailservers.

I chose to use a generated UUID for the user rather than using the incremental DB row.

Cookies must be enabled by the users browser for this auth scheme to work. The only thing stored in the cookie is a JWT.

JWT's can be used forever to login, or until it is expired. There is [no simple way to log out](https://medium.com/devgorilla/how-to-log-out-when-using-jwt-a8c7823e8a6) when using a JWT for auth, as they are stateless and stored on the client. One method of "logging out" the user is to clear cookies. You may want to set cookie Max-Age, Domain, and [other settings](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) to your preference.

Notion.so uses a similar login-flow that this code is unabashadly inspired by.


## Summary of login flow

1. User visits web app and submits their email via login form on /register
1. DB creates a new record for the UNIQUE email in a USER Table. If user has already registered, db selects on the UNIQUE email.
1. Server generates a one-time use password and inserts in the PASSWORD column on the USER record
1. Server sets the client-cookie with a JWT using the user ID and one-time password as payload
1. Server sends the user an email with the one-time password
1. User enters the password in /login
1. Assuming the user didn't clear their cookies since requesting a password, the server extracts the password and ID from the JWT, and attempts to authenticates the user.
1. DB deletes one-time password from USER row
1. If authenticated, a new JWT is created with the user ID, and is replaced in the cookie.
1. User is now authenticated. The JWT from the cookie is used to auth future requests.
1. To log out, server clears the clients cookie. 


### Suggestions and TODO

- Expose user-configurable setting for session expiry time 
- Config for cookie Max-Age, Domain, etc settings


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
