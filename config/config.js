module.exports = {
    development: {
        username: 'root',
        password: null,
        database: 'deerwalk_goals',
        host: 'localhost',
        dialect: "mysql",
        operatorsAliases: false
    },
    test: {
        username: 'root',
        password: null,
        database: 'deerwalk_goals',
        host: 'localhost',
        dialect: "mysql",
        operatorsAliases: false
    },
    production: {
        username: 'deerwalk_goals',
        password: 'deerwalk_goals',
        database: 'deerwalk_goals',
        host: 'localhost',
        dialect: 'mysql',
        operatorsAliases: false
    }
};