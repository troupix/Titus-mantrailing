# Hike API Endpoints

This document describes the API endpoints for managing hikes.

## Create a new hike

*   **URL:** `/api/hike`
*   **Method:** `POST`
*   **Access:** Public (Authentication recommended)
*   **Request Body:**
    *   `name` (String, required): The name of the hike.
    *   `description` (String): A description of the hike.
    *   `location` (String): A description of the hike's location.
    *   `locationCoordinate` (Array<Number>): The geographical coordinates of the start.
    *   `startLocation` (Point): The starting location of the hike as a GeoJSON point.
    *   `distance` (Number): The distance of the hike in meters.
    *   `duration` (Number): The duration of the hike in seconds.
    *   `elevationGain` (Number): The total elevation gain in meters.
    *   `difficulty` (String): The difficulty of the hike (e.g., 'Easy', 'Moderate', 'Hard', 'Expert').
    *   `photos` (Array<String>): An array of URLs to photos of the hike.
    *   `userTrack` (Object): The user's track data.
    *   `dogTrack` (Object): The dog's track data.
    *   `date` (Date): The date of the hike.
*   **Success Response:**
    *   **Code:** 201 CREATED
    *   **Content:** The created hike object.
*   **Error Responses:**
    *   **Code:** 400 BAD REQUEST - Validation error.
    *   **Code:** 500 INTERNAL SERVER ERROR - Server error.

## Get all hikes

*   **URL:** `/api/hike`
*   **Method:** `GET`
*   **Access:** Public
*   **Success Response:**
    *   **Code:** 200 OK
    *   **Content:** An array of hike objects.
*   **Error Response:**
    *   **Code:** 500 INTERNAL SERVER ERROR - Server error.

## Get a hike by ID

*   **URL:** `/api/hike/:id`
*   **Method:** `GET`
*   **Access:** Public
*   **URL Parameters:**
    *   `id` (String, required): The ID of the hike.
*   **Success Response:**
    *   **Code:** 200 OK
    *   **Content:** The hike object.
*   **Error Responses:**
    *   **Code:** 404 NOT FOUND - Hike not found.
    *   **Code:** 500 INTERNAL SERVER ERROR - Server error.

## Update a hike

*   **URL:** `/api/hike/:id`
*   **Method:** `PUT`
*   **Access:** Public (Ownership verification recommended)
*   **URL Parameters:**
    *   `id` (String, required): The ID of the hike to update.
*   **Request Body:** An object containing the fields to update.
*   **Success Response:**
    *   **Code:** 200 OK
    *   **Content:** The updated hike object.
*   **Error Responses:**
    *   **Code:** 404 NOT FOUND - Hike not found.
    *   **Code:** 400 BAD REQUEST - Validation error.
    *   **Code:** 500 INTERNAL SERVER ERROR - Server error.

## Delete a hike

*   **URL:** `/api/hike/:id`
*   **Method:** `DELETE`
*   **Access:** Public (Ownership verification recommended)
*   **URL Parameters:**
    *   `id` (String, required): The ID of the hike to delete.
*   **Success Response:**
    *   **Code:** 200 OK
    *   **Content:** `{ "message": "Hike successfully deleted." }`
*   **Error Responses:**
    *   **Code:** 404 NOT FOUND - Hike not found.
    *   **Code:** 500 INTERNAL SERVER ERROR - Server error.
