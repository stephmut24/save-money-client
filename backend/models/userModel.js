import pool from "../config/db.js"

export const findUserByEmail = async (email) =>{
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0]
}

export const createUser = async (full_name, email, phone_number, password_hash, device_id) =>{
    const result = await pool.query(
        `INSERT INTO users (full_name, email, phone_number, password_hash, device_id, is_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, email, phone_number, device_id, is_verified`, [full_name, email, phone_number, password_hash, device_id, false]
    );
    return result.rows[0];

};
export const findUserById = async (id) =>{
    const result = await pool.query("SELECT id, full_name, email, is_verified FROM users WHERE id = $1", [id]);
    return result.rows[0];
}