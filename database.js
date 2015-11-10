var knex = require('knex')( require('./knexfile') );

var bookshelf = require('bookshelf')(knex);

var voteRepository = require('./vote_repository')();

voteRepository.recordVote({nodeId:"new-vite",voter:"1234"});

voteRepository.getAllVotes().then(function(result){
	console.log(result.toJSON());
});
