export const SQL = {
  createUser: `
    INSERT INTO users(email, password_hash)
    VALUES($1, $2)
    RETURNING id, email, created_at, updated_at
  `,
  findByEmail: `
    SELECT id, email, password_hash, created_at, updated_at
    FROM users
    WHERE email = $1
  `,
  findById: `
    SELECT id, email, created_at, updated_at
    FROM users
    WHERE id = $1
  `,
}; 