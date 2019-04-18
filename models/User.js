const UserModel = `CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    password VARCHAR(200) NOT NULL,
    avarta VARCHAR(200) NULL,
    created_at TIMESTAMP DEFAULT NOW()
)`;

module.exports = UserModel

