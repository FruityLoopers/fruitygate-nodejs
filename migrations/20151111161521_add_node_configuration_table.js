
exports.up = function(knex, Promise) {
    return knex.schema.createTable('node_configuration', function(table) {
        table.increments('id').primary()
        table.string('nodeId').unique()
        table.string('boxId')
        table.string('color')
        table.timestamps()
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('node_configuration')
};
