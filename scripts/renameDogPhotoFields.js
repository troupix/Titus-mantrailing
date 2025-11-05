const Dog = require('../Model/dog');

module.exports = {
    async up() {
        console.log('Running renameDogPhotoFields migration...');
        try {
            // Rename 'photo' to 'profilePhoto'
            const renameResult = await Dog.updateMany(
                { photo: { $exists: true } },
                { $rename: { 'photo': 'profilePhoto' } }
            );
            console.log(`renameDogPhotoFields migration (rename photo to profilePhoto) complete: ${renameResult.nModified} dogs updated.`);

            // Add 'presentationPhoto' field with default empty string
            const addFieldResult = await Dog.updateMany(
                { presentationPhoto: { $exists: false } },
                { $set: { presentationPhoto: '' } }
            );
            console.log(`renameDogPhotoFields migration (add presentationPhoto) complete: ${addFieldResult.nModified} dogs updated.`);

        } catch (error) {
            console.error('Error during renameDogPhotoFields migration:', error);
            throw error; // Re-throw to indicate migration failure
        }
    },
    // Optional: Add a 'down' function for rollback if needed
    // async down() {
    //     console.log('Running renameDogPhotoFields rollback...');
    //     try {
    //         await Dog.updateMany(
    //             { profilePhoto: { $exists: true } },
    //             { $rename: { 'profilePhoto': 'photo' } }
    //         );
    //         await Dog.updateMany(
    //             {}, 
    //             { $unset: { presentationPhoto: 1 } }
    //         );
    //         console.log('renameDogPhotoFields rollback complete.');
    //     } catch (error) {
    //         console.error('Error during renameDogPhotoFields rollback:', error);
    //         throw error; 
    //     }
    // }
};