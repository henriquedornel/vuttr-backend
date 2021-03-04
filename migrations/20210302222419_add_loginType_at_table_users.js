exports.up = function (knex, Promise) {
	return knex.schema.alterTable('users', table => {
		table.string('loginType').notNull().defaultTo('internal')
	})
}

exports.down = function (knex, Promise) {
	return knex.schema.alterTable('users', table => {
		table.dropColumn('loginType')
    })
}