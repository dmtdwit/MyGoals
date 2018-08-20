module.exports = {
    development: {
        username: 'root',
        password: null,
        database: 'mygoals',
        host: 'localhost',
        dialect: "mysql",
        operatorsAliases: false
    },
    test: {
        username: 'root',
        password: null,
        database: 'mygoals',
        host: 'localhost',
        dialect: "mysql",
        operatorsAliases: false
    },
    production: {
        username: 'mygoal',
        password: 'mygoal',
        database: 'mygoals',
        host: 'localhost',
        dialect: 'mysql',
        operatorsAliases: false
    }
};