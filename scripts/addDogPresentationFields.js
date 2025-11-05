const Dog = require('../Model/dog');

module.exports = {
    async up() {
        console.log('Running addDogPresentationFields migration...');
        try {
            const result = await Dog.updateMany(
                { 
                    $or: [
                        { legend: { $exists: false } },
                        { presentation: { $exists: false } }
                    ]
                },
                { 
                    $set: {
                        legend: '',
                        presentation: ''
                    }
                }
            );
            console.log(`addDogPresentationFields migration complete: ${result.nModified} dogs updated.`);
        } catch (error) {
            console.error('Error during addDogPresentationFields migration:', error);
            throw error; // Re-throw to indicate migration failure
        }
    },
    // Optional: Add a 'down' function for rollback if needed
    // async down() {
    //     console.log('Running addDogPresentationFields rollback...');
    //     try {
    //         await Dog.updateMany(
    //             {}, 
    //             { $unset: { legend: 1, presentation: 1 } }
    //         );
    //         console.log('addDogPresentationFields rollback complete.');
    //     } catch (error) {
    //         console.error('Error during addDogPresentationFields rollback:', error);
    //         throw error; 
    //     }
    // }
};
