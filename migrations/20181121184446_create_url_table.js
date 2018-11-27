
exports.up = function(knex, Promise) {
  return knex.schema.createTable('urls', function (t) {
    t.string('abbreviated_url').primary();
    t.string('original_url', 2071).notNullable();
    t.integer('visits').defaultTo(0);
    t.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('urls');
};
