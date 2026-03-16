# TestAPI Spring Boot Application

This project is a RESTful backend built with **Java Spring Boot** and **Supabase** as the cloud database and authentication provider.

## Features implemented

- Supabase Authentication integration for login and registration
- User profile stored in Supabase Postgres (`profiles` table)
- APIs for profile retrieval, edit, password change, and photo upload
- Images are saved as BLOB bytes in the database
- JPA / Hibernate used to access the `profiles` table
- Error handling with global exception advice

## Configuration

By default the application uses an **in-memory H2 database** so you can run it locally without any cloud connection. Spring Boot’s auto-configuration handles data source setup automatically based on the properties.

To switch to Supabase, edit `src/main/resources/application.properties` and uncomment/set the following values with your project settings:

```properties
supabase.url=https://<your-project>.supabase.co          # your Supabase project URL
supabase.api.key=<your-anon-or-service-key>             # copy from Supabase settings

spring.datasource.url=jdbc:postgresql://<your-host>:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=<your-db-password>
``` 

The `ddl-auto=update` property will create the `profiles` table automatically when connected to Supabase.

## Running the application

Use Maven or your IDE to run `TestApiApplication`. The server listens on `http://localhost:8080` by default.

## API Endpoints

All endpoints are prefixed with `/api`.

1. **POST /api/register**
   - Request body: `{ "email": "user@example.com", "password": "secret", "displayName": "User" }`
   - Response: `AuthResponse` with success message

2. **POST /api/login**
   - Request body: `{ "email": "user@example.com", "password": "secret" }`
   - Response: `AuthResponse` containing an `token` (Supabase access token)

3. **GET /api/profile**
   - Header: `Authorization: Bearer <token>`
   - Response: profile data

4. **PUT /api/profile**
   - Header: `Authorization: Bearer <token>`
   - Request body: `{ "displayName": "New name" }`
   - Response: message

5. **PUT /api/password**
   - Header: `Authorization: Bearer <token>`
   - Request body: `{ "newPassword": "newSecret" }`

6. **POST /api/uploadPhoto**
   - Header: `Authorization: Bearer <token>`
   - Multipart form-data with key `file` containing `.jpg` or `.png`

## Postman testing

- Create a collection and add requests matching the endpoints above.
- After registering a user, copy the `token` from the login response into the `Authorization` header for secured calls.

> **Note:** Supabase may require usage of a service role key for certain operations (e.g. password change); adjust `supabase.api.key` accordingly.

## Database schema

```sql
CREATE TABLE profiles (
    id uuid PRIMARY KEY,
    email text NOT NULL UNIQUE,
    display_name text,
    photo bytea
);
```

## Next steps

- Deploy to cloud or containerize
- Add unit/integration tests
- Handle refresh tokens and expiry

Enjoy testing with Postman! 🎯
