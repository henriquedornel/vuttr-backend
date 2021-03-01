exports.up = function (knex, Promise) {
	return knex.schema.alterTable('tools', table => {
		table.integer('userId').references('id').inTable('users')
	})
}

exports.down = function (knex, Promise) {
	return knex.schema.alterTable('tools', table => {
		table.dropColumn('userId')
	})
}