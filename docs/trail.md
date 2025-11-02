# Trail Model

The `Trail` model represents a mantrailing session.

## Schema

| Field                | Type      | Description                                     | Required | Default     |
| -------------------- | --------- | ----------------------------------------------- | -------- | ----------- |
| `_id`                | ObjectId  | The unique identifier of the trail.             | Yes      | auto        |
| `trainer`            | String    | The name of the trainer.                        | No       |             |
| `dogName`            | String    | The name of the dog.                            | Yes      |             |
| `handlerName`        | String    | The name of the handler.                        | Yes      |             |
| `distance`           | Number    | The distance of the trail in meters.            | No       |             |
| `location`           | String    | The location of the trail.                      | No       |             |
| `date`               | Date      | The date of the trail.                          | No       | `Date.now`  |
| `duration`           | Number    | The duration of the trail in seconds.           | No       |             |
| `delay`              | Number    | The delay before the start of the trail in seconds. | No       | `0`         |
| `notes`              | String    | Notes about the trail.                          | No       | `''`        |
| `trailType`          | String    | The type of trail.                              | No       |             |
| `startType`          | String    | The start type of the trail.                    | No       | `'knowing'` |
| `locationCoordinate` | Array     | The coordinates of the trail location.          | No       |             |
| `runnerTrace`        | Object    | The trace of the runner.                        | No       |             |
| `dogTrace`           | Object    | The trace of the dog.                           | No       |             |
