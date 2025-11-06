# User Management Feature Documentation

This document provides a comprehensive overview of the User Management feature, including its data models, API endpoints, and frontend components.

## Feature Description

The User Management feature is responsible for user authentication, user profiles, and dog management. It allows users to register, log in, manage their profile information, and add, edit, or delete their dogs.

## Data Models

### User Schema

| Field | Type | Description | Required | Default |
| :--- | :--- | :--- | :--- | :--- |
| `username` | String | The name of the user. | Yes | |
| `email` | String | The email of the user. | Yes | |
| `password` | String | The hashed password of the user. | Yes | |
| `profilePicture` | String | URL to the user's profile picture. | No | |
| `role` | Array<String> | The roles of the user (e.g., 'user', 'trainer'). | Yes | `['user']` |
| `dogs` | Array<ObjectId> | An array of dog IDs owned by the user. | No | |
| `trainedDogs` | Array<ObjectId> | An array of dog IDs trained by the user. | No | |

### Dog Schema

| Field | Type | Description | Required | Default |
| :--- | :--- | :--- | :--- | :--- |
| `name` | String | The name of the dog. | Yes | |
| `breed` | String | The breed of the dog. | No | |
| `birthDate` | Date | The birth date of the dog. | No | |
| `profilePhoto` | String | URL to the dog's profile photo. | No | |
| `presentationPhoto` | String | URL to the dog's presentation photo. | No | |
| `legend` | String | A legend for the presentation photo. | No | |
| `presentation` | String | A presentation text for the dog. | No | |
| `ownerIds` | Array<ObjectId> | An array of user IDs who own the dog. | Yes | |
| `trainerIds` | Array<ObjectId> | An array of user IDs who train the dog. | No | |

## API Endpoints

### Authentication

*   **POST /api/user/login**: Authenticates a user and returns a JWT token.
*   **POST /api/user/register**: Registers a new user.
*   **GET /api/user/check**: Checks if a user is authenticated.
*   **POST /api/user/picture**: Uploads a profile picture for the user.

### User Management

*   **GET /api/userManagement**: Retrieves all users.
*   **GET /api/userManagement/:id**: Retrieves a user by ID.
*   **POST /api/userManagement/create**: Creates a new user.
*   **PUT /api/userManagement/:id**: Updates a user by ID.
*   **DELETE /api/userManagement/:id**: Deletes a user by ID.

### Dog Management

*   **POST /api/dog**: Creates a new dog.
*   **GET /api/dog**: Retrieves all dogs for the authenticated user.
*   **GET /api/dog/:id**: Retrieves a dog by ID.
*   **PUT /api/dog/:id**: Updates a dog by ID.
*   **DELETE /api/dog/:id**: Deletes a dog by ID.
*   **PUT /api/dog/:id/presentation**: Updates the presentation of a dog.
*   **POST /api/dog/upload-profile-photo**: Uploads a profile photo for a dog.

## Frontend Components

### LoginPage.tsx

This component provides a form for user login and registration.

### ProfilePage.tsx

This component allows users to view and edit their profile information, such as their name and email.

### ManagementPage.tsx

This component is the main interface for managing dogs. It allows users to:
- View a list of their dogs.
- Add a new dog.
- Edit an existing dog's information (name, breed, birth date, photo).
- Delete a dog.
- Manage the presentation of a dog (photo, legend, text).

### DogSelector.tsx

This is a reusable component that provides a dropdown menu to select a dog from the user's list of dogs.
