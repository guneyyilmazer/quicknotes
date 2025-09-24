export const SQL = {
  create: `
    INSERT INTO notes(user_id, title, content, tags)
    VALUES($1, $2, $3, $4)
    RETURNING id, user_id, title, content, tags, created_at, updated_at
  `,
  listByUser: `
    SELECT id, user_id, title, content, tags, created_at, updated_at
    FROM notes WHERE user_id=$1 ORDER BY updated_at DESC
  `,
  getById: `
    SELECT id, user_id, title, content, tags, created_at, updated_at
    FROM notes WHERE id=$1 AND user_id=$2
  `,
  update: `
    UPDATE notes SET title=$3, content=$4, tags=$5
    WHERE id=$1 AND user_id=$2
    RETURNING id, user_id, title, content, tags, created_at, updated_at
  `,
  remove: `
    DELETE FROM notes WHERE id=$1 AND user_id=$2 RETURNING id
  `,
  searchByTags: `
    SELECT id, user_id, title, content, tags, created_at, updated_at
    FROM notes
    WHERE user_id=$1 AND tags && $2::text[]
    ORDER BY updated_at DESC
  `,
}; 