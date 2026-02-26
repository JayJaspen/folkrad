import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

// Anropa GET /api/setup en gång för att skapa tabellerna.
// Ta bort eller skydda denna route i produktion.
export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        gender VARCHAR(20) NOT NULL,
        birth_year INTEGER NOT NULL,
        county VARCHAR(100) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

    await sql`
      CREATE TABLE IF NOT EXISTS sms_codes (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question_text TEXT NOT NULL,
        options JSONB NOT NULL,
        publish_at TIMESTAMP NOT NULL,
        close_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

    await sql`
      CREATE TABLE IF NOT EXISTS question_votes (
        id SERIAL PRIMARY KEY,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        selected_option INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(question_id, user_id)
      )`;

    await sql`
      CREATE TABLE IF NOT EXISTS party_votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        party VARCHAR(100) NOT NULL,
        last_changed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

    // Skapa admin-konto (lösenord: admin123 — BYT DETTA!)
    const hash = await bcrypt.hash('admin123', 10);
    await sql`
      INSERT INTO users (name, email, phone, password_hash, gender, birth_year, county, is_admin)
      VALUES ('Admin', 'admin@folkradet.se', '+46000000000', ${hash}, 'Vill ej ange', 1990, 'Stockholm', TRUE)
      ON CONFLICT (email) DO NOTHING`;

    return NextResponse.json({
      success: true,
      message: 'Alla tabeller skapade! Admin-konto: admin@folkradet.se / admin123'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
