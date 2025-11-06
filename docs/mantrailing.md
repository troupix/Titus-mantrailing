# Mantrailing Feature Documentation

This document provides a comprehensive overview of the Mantrailing feature, including its data model, API endpoints, and frontend components.

## Feature Description

The Mantrailing feature allows users to record, view, and manage their mantrailing trails. It captures detailed information about each trail, such as the dog, handler, trainer, location, and various trail parameters.

The frontend provides a user-friendly interface to display mantrailing trail details, including an interactive map showing the runner's and dog's tracks, and a form to create or edit trails.

## Data Model

The Mantrailing feature uses the `Trail` model. Here is the schema:

| Field | Type | Description | Required | Default |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | The unique identifier of the trail. | Yes | auto |
| `userId` | ObjectId | The ID of the user who created the trail. | Yes | |
| `trainer` | String | The name of the trainer for the trail. | No | |
| `dog` | ObjectId | The ID of the dog used for the trail. | Yes | |
| `handlerName` | String | The name of the handler. | Yes | |
| `distance` | Number | The distance of the trail in meters. | No | |
| `location` | String | A description of the trail's location. | No | |
| `date` | Date | The date and time of the trail. | No | `Date.now` |
| `duration` | Number | The duration of the trail in seconds. | No | |
| `delay` | Number | The time delay in seconds before the dog starts. | No | `0` |
| `notes` | String | Any notes related to the trail. | No | `''` |
| `trainerComment` | String | A private comment from the trainer. | No | `''` |
| `trailType` | String | The type of trail (e.g., urban, rural). | No | |
| `startType` | String | The type of start for the trail. | No | `'knowing'` |
| `locationCoordinate` | Array | The geographical coordinates of the start. | No | |
| `runnerTrace` | Object | GeoJSON object for the runner's path. | No | |
| `dogTrace` | Object | GeoJSON object for the dog's path. | No | |
| `weather` | Object | Weather conditions during the trail. | No | |

## API Endpoints

The following API endpoints are available for managing mantrailing trails.

### Get all trails for a user

*   **URL:** `/api/mantrailing`
*   **Method:** `GET`
*   **Access:** Private
*   **Success Response:** 200 OK, with an array of trail objects.
*   **Error Response:** 500 INTERNAL SERVER ERROR.

### Save a new trail

*   **URL:** `/api/mantrailing/save`
*   **Method:** `POST`
*   **Access:** Private
*   **Request Body:** See Trail Schema above.
*   **Success Response:** 201 CREATED, with the created trail object.
*   **Error Responses:** 400 BAD REQUEST, 500 INTERNAL SERVER ERROR.

### Delete a trail

*   **URL:** `/api/mantrailing/delete`
*   **Method:** `POST`
*   **Access:** Private
*   **Request Body:** `{ "id": "<trail_id>" }`
*   **Success Response:** 200 OK, with a success message.
*   **Error Responses:** 404 NOT FOUND.

### Update a trail

*   **URL:** `/api/mantrailing/update`
*   **Method:** `POST`
*   **Access:** Private
*   **Request Body:** `{ "id": "<trail_id>", "trail": { ... } }`
*   **Success Response:** 200 OK, with a success message.
*   **Error Responses:** 400 BAD REQUEST, 404 NOT FOUND.

## Frontend Components

### MantrailingDetails.tsx

This component is responsible for displaying the details of a specific mantrailing trail. It shows:
- Quick stats: distance and duration.
- A map with the runner's and dog's tracks.
- Information about the dog, handler, trainer, trail type, start type, and delay.
- Notes and private trainer comments.
- Weather details.

### MantrailingForm.tsx

This component provides a form for creating and editing mantrailing trails. It includes fields for:
- Selecting a dog.
- Handler's name.
- Trainer's name.
- Trail type.
- Start type.
- Delay.
- A private comment field for trainers.
