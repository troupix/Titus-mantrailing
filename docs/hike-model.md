# Hike Model

The `Hike` model represents a hiking activity. It includes details about the trail, location, and tracking data for both the user and their dog.

## Point Schema

The `Point` schema is a GeoJSON-like structure used to store geographical coordinates.

| Field         | Type          | Description                            | Required |
| ------------- | ------------- | -------------------------------------- | -------- |
| `type`        | String        | The type of the point, must be 'Point'.| Yes      |
| `coordinates` | Array<Number> | [longitude, latitude]                  | Yes      |

## Hike Schema

| Field                | Type           | Description                                      | Required | Default        |
| -------------------- | -------------- | ------------------------------------------------ | -------- | -------------- |
| `_id`                | ObjectId       | The unique identifier of the hike.               | Yes      | auto           |
| `name`               | String         | The name of the hike.                            | Yes      |                |
| `description`        | String         | A description of the hike.                       | No       |                |
| `location`           | String         | A description of the hike's location.            | No       |                |
| `locationCoordinate` | Array          | The geographical coordinates of the start.       | No       |                |
| `startLocation`      | Point          | The starting location of the hike.               | No       |                |
| `distance`           | Number         | The distance of the hike in meters.              | No       | `0`            |
| `duration`           | Number         | The duration of the hike in seconds.             | No       | `0`            |
| `elevationGain`      | Number         | The total elevation gain in meters.              | No       | `0`            |
| `difficulty`         | String         | The difficulty of the hike.                      | No       | `'Moderate'`   |
| `photos`             | Array<String>  | An array of URLs to photos of the hike.          | No       |                |
| `userTrack`          | Object         | The user's track data.                           | No       | `null`         |
| `dogTrack`           | Object         | The dog's track data.                            | No       | `null`         |
| `createdAt`          | Date           | The date and time the hike was created.          | No       | `Date.now`     |
| `date`               | Date           | The date of the hike.                            | No       | `Date.now`     |
