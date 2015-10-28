
exports.up = function(knex, Promise) {
    return knex.schema.createTable('fruity_votes', function(table) {
        table.increments('id').primary()
        table.string('nodeId')
        table.string('tagId')
        table.timestamps()
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('fruity_votes')
};
