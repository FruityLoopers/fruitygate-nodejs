
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('fruity_votes', function(table) {
          return table.string('voteTime');
    })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('fruity_votes', function(table) {
          return table.dropColumn('voteTime');
    })

};
