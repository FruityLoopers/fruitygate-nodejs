var knex = require('knex')( require('./knexfile') );
var bookshelf = require('bookshelf')(knex);

var Votes = bookshelf.Model.extend({
  tableName: 'fruity_votes',
  hasTimestamps: true
});

module.exports = function createVoteRepository(){
    function recordVote(voteParams){
        return Votes.forge(voteParams).save();
    }

    function getAllVotes(){
        return Votes.fetchAll({'columns': ['voter', 'nodeId', 'voteTime', 'created_at']});
    }

    return {
        recordVote: recordVote,
        getAllVotes: getAllVotes
    };
}
