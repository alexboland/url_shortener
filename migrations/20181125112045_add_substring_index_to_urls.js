
exports.up = function(knex, Promise) {
  return knex.schema.raw('create index url_prefix on urls (original_url(255));');
};

exports.down = function(knex, Promise) {
  return knex.schema.raw('drop index url_prefix on urls (original_url(255));');
};
