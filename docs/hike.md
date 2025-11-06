# Hike Feature Documentation

This document provides a comprehensive overview of the Hike feature, including its data model, API endpoints, and frontend components.

## Feature Description

The Hike feature allows users to record, view, and manage their hiking activities. It captures detailed information about each hike, such as the trail name, description, location, distance, duration, elevation gain, and difficulty. Users can also upload photos and track their path, as well as their dog's path, using GPX data.

The frontend provides a user-friendly interface to display hike details, including an interactive map showing the recorded tracks, and a form to create or edit hikes.

## Data Model

The `Hike` model represents a hiking activity in the database.

### Point Schema

A GeoJSON-like structure for storing geographical coordinates.

| Field | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| `type` | String | The type of the point, must be 'Point'.| Yes |
| `coordinates` | Array<Number> | [longitude, latitude] | Yes |

### Hike Schema

| Field | Type | Description | Required | Default |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | The unique identifier of the hike. | Yes | auto |
| `name` | String | The name of the hike. | Yes | |
| `description` | String | A description of the hike. | No | |
| `location` | String | A description of the hike's location. | No | |
| `locationCoordinate` | Array | The geographical coordinates of the start. | No | |
| `startLocation` | Point | The starting location of the hike. | No | |
| `distance` | Number | The distance of the hike in meters. | No | `0` |
| `duration` | Number | The duration of the hike in seconds. | No | `0` |
| `elevationGain` | Number | The total elevation gain in meters. | No | `0` |
| `difficulty` | String | The difficulty of the hike. | No | `'Moderate'` |
| `photos` | Array<String> | An array of URLs to photos of the hike. | No | |
| `userTrack` | Object | The user's track data. | No | `null` |
| `dogTrack` | Object | The dog's track data. | No | `null` |
| `createdAt` | Date | The date and time the hike was created. | No | `Date.now` |
| `date` | Date | The date of the hike. | No | `Date.now` |

## API Endpoints

The following API endpoints are available for managing hikes.

### Create a new hike

*   **URL:** `/api/hike`
*   **Method:** `POST`
*   **Access:** Public (Authentication recommended)
*   **Request Body:** See Hike Schema above.
*   **Success Response:** 201 CREATED, with the created hike object.
*   **Error Responses:** 400 BAD REQUEST, 500 INTERNAL SERVER ERROR.

### Get all hikes

*   **URL:** `/api/hike`
*   **Method:** `GET`
*   **Access:** Public
*   **Success Response:** 200 OK, with an array of hike objects.
*   **Error Response:** 500 INTERNAL SERVER ERROR.

### Get a hike by ID

*   **URL:** `/api/hike/:id`
*   **Method:** `GET`
*   **Access:** Public
*   **Success Response:** 200 OK, with the hike object.
*   **Error Responses:** 404 NOT FOUND, 500 INTERNAL SERVER ERROR.

### Update a hike

*   **URL:** `/api/hike/:id`
*   **Method:** `PUT`
*   **Access:** Public (Ownership verification recommended)
*   **Success Response:** 200 OK, with the updated hike object.
*   **Error Responses:** 404 NOT FOUND, 400 BAD REQUEST, 500 INTERNAL SERVER ERROR.

### Delete a hike

*   **URL:** `/api/hike/:id`
*   **Method:** `DELETE`
*   **Access:** Public (Ownership verification recommended)
*   **Success Response:** 200 OK, with a success message.
*   **Error Responses:** 404 NOT FOUND, 500 INTERNAL SERVER ERROR.

## Frontend Components

### HikingDetails.tsx

This component is responsible for displaying the details of a specific hike. It shows:
- Quick stats: distance, duration, elevation gain, and difficulty.
- A map with the user's and dog's tracks.
- A description of the hike.
- The maximum distance between the user and the dog.
- Photos of the hike.

### HikingForm.tsx

This component provides a form for creating and editing hikes. It includes fields for:
- Name of the hike.
- Description.
- Difficulty.
- Elevation gain.
- Photos.
