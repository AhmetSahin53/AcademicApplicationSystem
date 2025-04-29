import mysql from "mysql2/promise"
import dotenv from "dotenv"

// Çevre değişkenlerini yükle
dotenv.config()

// Bağlantı ayarlarını göster
console.log("Veritabanı bağlantı ayarları:")
console.log(`Host: ${process.env.DB_HOST || "localhost"}`)
console.log(`User: ${process.env.DB_USER || "root"}`)
console.log(`Database: ${process.env.DB_NAME || "akademik_basvuru"}`)

// MySQL bağlantı havuzu oluşturma
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "sanane53",
  database: process.env.DB_NAME || "akademik_basvuru",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Veritabanı bağlantısını test etme
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("MySQL veritabanına başarıyla bağlandı")
    connection.release()
    return true
  } catch (error) {
    console.error("MySQL veritabanına bağlanırken hata oluştu:", error)
    return false
  }
}

export { pool, testConnection }
