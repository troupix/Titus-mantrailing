const Trail = require('../Model/trail');

module.exports = {
    async up() {
        console.log('Running addTrainerCommentToTrails migration...');
        const result = await Trail.updateMany(
            { trainerComment: { $exists: false } },
            { $set: { trainerComment: '' } }
        );
        console.log(`addTrainerCommentToTrails migration complete: ${result.nModified} trails updated.`);
    },
    // You can add a 'down' function for rollback if needed
    // async down() {
    //     console.log('Running addTrainerCommentToTrails rollback...');
    //     await Trail.updateMany(
    //         {}, // Select all documents
    //         { $unset: { trainerComment: 1 } } // Remove the field
    //     );
    //     console.log('addTrainerCommentToTrails rollback complete.');
    // }
};