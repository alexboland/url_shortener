
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('urls', function(t) {
    t.index('visits')
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('urls', function(t) {
    t.dropIndex('visits')
  });
};
