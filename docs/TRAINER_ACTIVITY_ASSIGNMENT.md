# Feature: Trainer-Dog Activity-Specific Assignment

## 1. Overview

This feature enhances the relationship between trainers and dogs by making it activity-specific. Currently, a trainer assigned to a dog has access to all of the dog's activities. This update will allow a dog owner to assign a trainer to their dog for one or more specific activities (e.g., Mantrailing, Hiking).

This provides more granular control for dog owners and allows trainers to have a more focused view of the dogs and activities they are responsible for.

## 2. Backend Changes

### 2.1. Data Model Changes

#### 2.1.1. Dog Model

The `Dog` model needs to be updated. The current `trainerIds` field will be replaced by a `trainers` field to store activity-specific assignments.

**New `Dog` Schema (simplified):**
```javascript
const dogSchema = new mongoose.Schema({
  // ... other fields
  trainers: [{
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    activities: [{
      type: String,
      enum: ['mantrailing', 'hiking', 'canicross'], // Add other activities as they are created
      required: true
    }]
  }]
});
```

#### 2.1.2. New `DogShareLink` Model

A new model will be created to handle the secure, time-limited sharing process.

```javascript
const dogShareLinkSchema = new mongoose.Schema({
  dogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dog', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true, index: true },
  activities: [{
    type: String,
    enum: ['mantrailing', 'hiking', 'canicross'],
    required: true
  }],
  expiresAt: { type: Date, required: true }
});
```

### 2.2. API Endpoints

The API will be updated to manage the new sharing workflow.

*   **`POST /api/dogs/:dogId/share`**: (Owner) Generates a time-limited, activity-specific share token.
    *   **Permissions:** Dog owner only.
    *   **Body:** `{ "activities": ["mantrailing", "hiking"], "expiresInHours": 24 }`
    *   **Action:** Creates a `DogShareLink` document with a unique token and an expiration date. Returns the token to the owner.

*   **`POST /api/trainer/claim-dog`**: (Trainer) A trainer uses a share token to get assigned to a dog.
    *   **Permissions:** Authenticated trainer only.
    *   **Body:** `{ "shareToken": "..." }`
    *   **Action:**
        1.  Finds the `DogShareLink` by the token and verifies it's not expired.
        2.  Adds or updates the trainer's entry in the corresponding dog's `trainers` array, merging the activities from the token.
        3.  Deletes the `DogShareLink` to prevent reuse.
        4.  Returns a success message.

*   **`PUT /api/dogs/:dogId/trainers/:trainerId`**: (Owner) Manually update the activities for an assigned trainer.
    *   **Permissions:** Dog owner only.
    *   **Body:** `{ "activities": ["mantrailing", "hiking"] }`
    *   **Action:** Updates the `activities` array for the specified trainer on that dog.

*   **`DELETE /api/dogs/:dogId/trainers/:trainerId`**: (Owner) Unassign a trainer from a dog.
    *   **Permissions:** Dog owner only.
    *   **Action:** Removes the trainer's entry from the `trainers` array.

### 2.3. Modified API Endpoints

*   **`GET /api/trainer/dogs`**: Returns all dogs a trainer is assigned to. The logic will be: find all dogs where the `trainers` array contains an object with the current trainer's ID.
*   **`GET /api/trails/dog/:dogId`**: When a trainer accesses this endpoint, the backend must verify that the trainer is assigned to the dog for the activity type of the trails being requested.

## 3. Frontend Changes

### 3.1. Dog Management View (for Dog Owners)

In `ManagementPage.tsx`, the UI for managing trainers for a dog will be updated.

*   Display a list of currently assigned trainers and their associated activities.
*   Include a "Share Dog" button for each dog.
*   Clicking "Share Dog" will open a modal where the owner can:
    1.  Select one or more activities using a multi-select component.
    2.  Generate a unique, time-limited share code.
    3.  Copy the code to their clipboard to send to a trainer.

### 3.2. Trainer Dashboard (for Trainers)

The `TrainerDashboard.tsx` will be updated to allow trainers to claim dogs.

*   Add an "Add Dog with Code" button.
*   This button will open a modal with an input field for the trainer to paste the share code received from a dog owner.
*   Submitting the code will call the `POST /api/trainer/claim-dog` endpoint. The dashboard will then refresh to show the newly added dog.

### 3.3. Trail Form

When creating a new trail (`TrailForm.tsx`, etc.), if the user is a dog owner, the form should include a dropdown to select which trainer was present. This dropdown will be populated with trainers assigned to the dog for that specific activity.

## 4. Data Migration

A migration script (`scripts/migrateTrainerAssignments.js`) will update the database schema.

1.  Connect to the MongoDB database.
2.  Find all `Dog` documents with a non-empty `trainerIds` array.
3.  For each dog, transform the `trainerIds` array into the new `trainers` array.
4.  By default, all existing assignments will be for the "mantrailing" activity.
5.  The old `trainerIds` field will be unset.

**Example Migration Logic:**
```javascript
// Not for execution, just for documentation
db.dogs.find({ "trainerIds": { $exists: true, $ne: [] } }).forEach(function(dog) {
  const newTrainers = dog.trainerIds.map(function(trainerId) {
    return {
      trainerId: trainerId,
      activities: ["mantrailing"] // Default activity
    };
  });

  db.dogs.updateOne(
    { "_id": dog._id },
    {
      $set: { "trainers": newTrainers },
      $unset: { "trainerIds": "" }
    }
  );
});
```

## 5. Sharing Workflow Summary

The previous "Open Questions" have been resolved with the following workflow:

1.  **Generation (Owner):** A dog owner decides to grant a trainer access to their dog for specific activities. From the dog's management page, they click "Share", select the desired activities (e.g., "Mantrailing", "Hiking"), and generate a unique, time-limited (e.g., 24 hours) share code.
2.  **Distribution (Owner):** The owner copies this code and sends it to the trainer via any communication channel (email, text, etc.).
3.  **Claiming (Trainer):** The trainer, logged into their account, goes to their dashboard and chooses to "Add Dog with Code". They paste the code into a form.
4.  **Verification (Backend):** The system validates the code, checks that it hasn't expired, and automatically assigns the trainer to the dog for the activities encoded in the share code. The code is then deleted to prevent reuse.
5.  **Access Granted:** The dog now appears on the trainer's dashboard, with access restricted to the specified activities. No manual approval or notifications are needed.
