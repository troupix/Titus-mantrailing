# Mantrailing API

This is the backend API for the Mantrailing application. It provides endpoints to manage trails, users, and user authentication.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v20.x)
*   npm
*   MongoDB

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/maximilien/maximilien.git
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root of the project and add the following environment variables:
    ```
    MONGODB_URI=<your_mongodb_uri>
    ACCESS_TOKEN_SECRET=<your_jwt_secret>
    PORT=5000
    ```

4.  Start the server:
    ```bash
    npm start
    ```

## Running the tests

To run the unit tests, use the following command:

```bash
npm test
```

## API Documentation

The API provides the following endpoints:

### Mantrailing

*   `GET /api/mantrailing`: Get all trails.
*   `POST /api/mantrailing/save`: Save a new trail.
*   `POST /api/mantrailing/delete`: Delete a trail.
*   `POST /api/mantrailing/update`: Update a trail.

### User

*   `POST /api/user/login`: Authenticate a user and get a JWT token.
*   `POST /api/user/register`: Register a new user.
*   `GET /api/user/check`: Check if a user is authenticated.

### User Management

*   `GET /api/users`: Get all users.
*   `GET /api/users/:id`: Get a user by ID.
*   `POST /api/users/create`: Create a new user.
*   `PUT /api/users/:id`: Update a user.
*   `DELETE /api/users/:id`: Delete a user.

## Deployment

The project is automatically deployed to a VPC using GitHub Actions. The deployment process is defined in the `.github/workflows/node.js.yml` file and uses PM2 for process management.
