# Trails Feature Documentation

This document provides a comprehensive overview of how activities (referred to as "Trails") are managed in the application. This covers both Mantrailing and Hiking activities.

## Feature Description

The application allows users to record, view, and manage two types of activities: Mantrailing trails and Hikes. While these activities have distinct properties, they share a common set of features for creation, editing, and display.

## Data Models

Both Mantrailing and Hiking activities are stored in the database using a common `Trail` model, with a `category` field to differentiate between them. Here is a unified schema:

### Common Fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | The unique identifier of the activity. |
| `userId` | ObjectId | The ID of the user who created the activity. |
| `category` | String | The category of the activity (`mantrailing` or `hiking`). |
| `date` | Date | The date of the activity. |
| `location` | String | A description of the activity's location. |
| `distance` | Number | The distance of the activity in meters. |
| `duration` | Number | The duration of the activity in seconds. |
| `notes` | String | Any notes related to the activity. |
| `dogTrace` | Object | GeoJSON object for the dog's path. |
| `weather` | Object | Weather conditions during the activity. |

### Mantrailing Specific Fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `dog` | ObjectId | The ID of the dog used for the trail. |
| `handlerName` | String | The name of the handler. |
| `trainer` | String | The name of the trainer for the trail. |
| `trainerComment` | String | A private comment from the trainer. |
| `trailType` | String | The type of trail (e.g., urban, rural). |
| `startType` | String | The type of start for the trail. |
| `delay` | Number | The time delay in seconds before the dog starts. |
| `runnerTrace` | Object | GeoJSON object for the runner's path. |

### Hiking Specific Fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | The name of the hike. |
| `description` | String | A description of the hike. |
| `difficulty` | String | The difficulty of the hike. |
| `elevationGain` | Number | The total elevation gain in meters. |
| `photos` | Array<String> | An array of URLs to photos of the hike. |
| `userTrack` | Object | The user's track data. |
| `startLocation` | Point | The starting location of the hike. |

## API Endpoints

The API endpoints for managing activities are specific to each activity type:

*   **Mantrailing:** See the [Mantrailing Feature Documentation](mantrailing.md) for details on the `/api/mantrailing` endpoints.
*   **Hiking:** See the [Hike Feature Documentation](hike.md) for details on the `/api/hike` endpoints.

## Frontend Components

### TrailList.tsx

This component displays a list of all activities (both Mantrailing and Hiking) for the authenticated user. It allows filtering by category and groups the activities by month.

### TrailDetail.tsx

This component is a generic container that displays the details of a selected activity. It uses the `MantrailingDetails.tsx` or `HikingDetails.tsx` component to render the specific details for each activity type.

### TrailForm.tsx

This is the main component for creating and editing both Mantrailing and Hiking activities. It provides a form with common fields and dynamically displays the specific fields for the selected activity category.

### TrailMap.tsx

A reusable component that displays a map with the tracks of the dog and the user/runner.
