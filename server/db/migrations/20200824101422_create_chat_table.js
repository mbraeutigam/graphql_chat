exports.up = async (knex) => {
  return knex.schema.createTableIfNotExists("ChatMessages", (table) => {
    table.string("id").primary();
    table.string("room");
    table.string("user");
    table.string("message");
    table.date("date");

    table.unique("id");
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("ChatMessages");
};
