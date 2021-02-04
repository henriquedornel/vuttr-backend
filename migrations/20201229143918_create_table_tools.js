exports.up = function (knex, Promise) {
	return knex.schema.createTable('tools', table => {
		table.increments('id').primary()
		table.string('title').notNull().unique()
		table.string('link').notNull()
		table.text('description')
        table.specificType('tags', 'varchar[]')
	})
}

exports.down = function (knex, Promise) {
	return knex.schema.dropTable('tools')
}