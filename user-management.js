import dotenv from "dotenv"
import bcrypt from "bcrypt"
import { pool } from "./config/database.js"
import readline from "readline"

// Çevre değişkenlerini yükle
dotenv.config()

// Readline arayüzü oluştur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Kullanıcıdan bilgi al
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer)
    })
  })
}

// TC Kimlik Numarası kontrolü
function validateTcNo(tcno) {
  // TC kimlik numarası 11 haneli olmalı ve sadece rakamlardan oluşmalı
  if (!/^\d{11}$/.test(tcno)) {
    return false
  }
  return true
}

// Veritabanı bağlantısını kontrol et
async function checkDatabaseConnection() {
  try {
    console.log("\n=== Veritabanı Bağlantı Kontrolü ===\n")
    console.log("Bağlantı ayarları:")
    console.log(`Host: ${process.env.DB_HOST || "localhost"}`)
    console.log(`User: ${process.env.DB_USER || "root"}`)
    console.log(`Database: ${process.env.DB_NAME || "akademik_basvuru"}`)

    const connection = await pool.getConnection()
    console.log("\n✅ Veritabanı bağlantısı başarılı!")

    // Kullanıcılar tablosunu kontrol et
    const [tables] = await connection.query("SHOW TABLES")
    console.log("\nVeritabanındaki tablolar:")
    tables.forEach((table) => {
      console.log(`- ${Object.values(table)[0]}`)
    })

    // Users tablosunu kontrol et
    const hasUsersTable = tables.some((table) => Object.values(table)[0] === "users")
    if (hasUsersTable) {
      console.log("\n✅ 'users' tablosu mevcut.")

      // Tablo yapısını kontrol et
      const [columns] = await connection.query("DESCRIBE users")
      console.log("\n'users' tablosu yapısı:")
      columns.forEach((column) => {
        console.log(
          `- ${column.Field}: ${column.Type} ${column.Null === "NO" ? "(NOT NULL)" : ""} ${column.Key === "PRI" ? "(PRIMARY KEY)" : ""}`,
        )
      })
    } else {
      console.log("\n❌ 'users' tablosu bulunamadı!")
    }

    connection.release()
    return true
  } catch (error) {
    console.error("\n❌ Veritabanı bağlantı hatası:", error)
    return false
  }
}

// Kullanıcı ekleme fonksiyonu
async function addUser() {
  try {
    console.log("\n=== Yeni Kullanıcı Ekleme ===\n")

    const tc_no = await question("TC Kimlik No (11 haneli): ")

    // TC Kimlik Numarası kontrolü
    if (!validateTcNo(tc_no)) {
      console.error("\n❌ Hata: TC Kimlik Numarası 11 haneli olmalı ve sadece rakamlardan oluşmalıdır.")
      return
    }

    const name = await question("Ad Soyad: ")
    const email = await question("E-posta: ")
    const password = await question("Şifre: ")
    const role = await question("Rol (admin, yonetici, juri, aday): ")

    // Rol kontrolü
    if (!["admin", "yonetici", "juri", "aday"].includes(role)) {
      console.error("\n❌ Hata: Geçersiz rol. Rol 'admin', 'yonetici', 'juri' veya 'aday' olmalıdır.")
      return
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log(`\nŞifre hashlendi: ${hashedPassword}`)

    // Kullanıcıyı veritabanına ekle
    console.log("\nKullanıcı veritabanına ekleniyor...")

    try {
      const [result] = await pool.query(
        "INSERT INTO users (tc_no, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [tc_no, name, email, hashedPassword, role],
      )

      console.log(`\n✅ Kullanıcı başarıyla eklendi! ID: ${result.insertId}`)
      console.log(`TC No: ${tc_no}`)
      console.log(`Ad: ${name}`)
      console.log(`E-posta: ${email}`)
      console.log(`Rol: ${role}`)
      console.log(`Şifre: ${password} (hashlendi ve kaydedildi)`)

      // Eklenen kullanıcıyı kontrol et
      const [users] = await pool.query("SELECT * FROM users WHERE tc_no = ?", [tc_no])
      if (users.length > 0) {
        console.log("\n✅ Kullanıcı veritabanında doğrulandı.")
      } else {
        console.log("\n❌ Kullanıcı veritabanında bulunamadı! Ekleme işlemi başarısız olmuş olabilir.")
      }
    } catch (dbError) {
      console.error("\n❌ Veritabanı hatası:", dbError)
      console.log("\nHata detayları:")
      console.log(`- Hata kodu: ${dbError.code}`)
      console.log(`- Hata mesajı: ${dbError.message}`)

      if (dbError.code === "ER_DUP_ENTRY") {
        console.log("\n⚠️ Bu TC kimlik numarası zaten kullanılıyor. Lütfen başka bir TC kimlik numarası deneyin.")
      }
    }
  } catch (error) {
    console.error("Kullanıcı ekleme hatası:", error)
  }
}

// Kullanıcı listeleme fonksiyonu
async function listUsers() {
  try {
    console.log("\n=== Kullanıcı Listesi ===\n")

    const [users] = await pool.query("SELECT id, tc_no, name, email, role, created_at FROM users ORDER BY id")

    if (users.length === 0) {
      console.log("Veritabanında hiç kullanıcı bulunamadı!")
      return
    }

    console.log("ID\tTC No\t\tAd\t\tE-posta\t\tRol\t\tKayıt Tarihi")
    console.log("---------------------------------------------------------------------------------")

    users.forEach((user) => {
      console.log(
        `${user.id}\t${user.tc_no}\t${user.name}\t${user.email}\t${user.role}\t${new Date(user.created_at).toLocaleString()}`,
      )
    })

    console.log(`\nToplam ${users.length} kullanıcı listelendi.`)
  } catch (error) {
    console.error("Kullanıcı listeleme hatası:", error)
  }
}

// Kullanıcı silme fonksiyonu
async function deleteUser() {
  try {
    console.log("\n=== Kullanıcı Silme ===\n")

    const tc_no = await question("Silinecek kullanıcının TC Kimlik No: ")

    // Kullanıcıyı kontrol et
    const [users] = await pool.query("SELECT id, name, role FROM users WHERE tc_no = ?", [tc_no])

    if (users.length === 0) {
      console.error(`\n❌ Hata: ${tc_no} TC numaralı kullanıcı bulunamadı!`)
      return
    }

    const user = users[0]
    console.log(`\nSilinecek kullanıcı: ${user.name} (${user.role})`)

    const confirm = await question("Bu kullanıcıyı silmek istediğinize emin misiniz? (e/h): ")

    if (confirm.toLowerCase() !== "e") {
      console.log("Silme işlemi iptal edildi.")
      return
    }

    // Kullanıcıyı sil
    await pool.query("DELETE FROM users WHERE tc_no = ?", [tc_no])

    console.log(`\n✅ ${tc_no} TC numaralı kullanıcı başarıyla silindi!`)
  } catch (error) {
    console.error("Kullanıcı silme hatası:", error)
  }
}

// Şifre güncelleme fonksiyonu
async function updatePassword() {
  try {
    console.log("\n=== Şifre Güncelleme ===\n")

    const tc_no = await question("Şifresi güncellenecek kullanıcının TC Kimlik No: ")

    // Kullanıcıyı kontrol et
    const [users] = await pool.query("SELECT id, name FROM users WHERE tc_no = ?", [tc_no])

    if (users.length === 0) {
      console.error(`\n❌ Hata: ${tc_no} TC numaralı kullanıcı bulunamadı!`)
      return
    }

    const user = users[0]
    console.log(`\nŞifresi güncellenecek kullanıcı: ${user.name}`)

    const password = await question("Yeni şifre: ")

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10)

    // Şifreyi güncelle
    await pool.query("UPDATE users SET password = ? WHERE tc_no = ?", [hashedPassword, tc_no])

    console.log(`\n✅ ${tc_no} TC numaralı kullanıcının şifresi başarıyla güncellendi!`)
  } catch (error) {
    console.error("Şifre güncelleme hatası:", error)
  }
}

// Hatalı TC kimlik numarasına sahip kullanıcıları temizle
async function cleanupInvalidUsers() {
  try {
    console.log("\n=== Hatalı Kullanıcıları Temizle ===\n")

    // 11 haneli olmayan TC kimlik numaralarını bul
    const [invalidUsers] = await pool.query("SELECT id, tc_no, name FROM users WHERE LENGTH(tc_no) != 11")

    if (invalidUsers.length === 0) {
      console.log("Hatalı TC kimlik numarasına sahip kullanıcı bulunamadı.")
      return
    }

    console.log(`${invalidUsers.length} adet hatalı TC kimlik numarasına sahip kullanıcı bulundu:`)
    invalidUsers.forEach((user) => {
      console.log(`- ID: ${user.id}, TC No: ${user.tc_no}, Ad: ${user.name}`)
    })

    const confirm = await question("\nBu kullanıcıları silmek istiyor musunuz? (e/h): ")

    if (confirm.toLowerCase() !== "e") {
      console.log("Silme işlemi iptal edildi.")
      return
    }

    // Hatalı kullanıcıları sil
    const [result] = await pool.query("DELETE FROM users WHERE LENGTH(tc_no) != 11")

    console.log(`\n✅ ${result.affectedRows} adet hatalı kullanıcı başarıyla silindi!`)
  } catch (error) {
    console.error("Hatalı kullanıcı temizleme hatası:", error)
  }
}

// Ana menü
async function mainMenu() {
  try {
    console.log("\n=== Kullanıcı Yönetim Sistemi ===\n")
    console.log("1. Kullanıcı Ekle")
    console.log("2. Kullanıcıları Listele")
    console.log("3. Kullanıcı Sil")
    console.log("4. Şifre Güncelle")
    console.log("5. Veritabanı Bağlantısını Kontrol Et")
    console.log("6. Hatalı Kullanıcıları Temizle")
    console.log("0. Çıkış")

    const choice = await question("\nSeçiminiz: ")

    switch (choice) {
      case "1":
        await addUser()
        break
      case "2":
        await listUsers()
        break
      case "3":
        await deleteUser()
        break
      case "4":
        await updatePassword()
        break
      case "5":
        await checkDatabaseConnection()
        break
      case "6":
        await cleanupInvalidUsers()
        break
      case "0":
        console.log("Programdan çıkılıyor...")
        rl.close()
        process.exit(0)
        break
      default:
        console.log("Geçersiz seçim! Lütfen tekrar deneyin.")
    }

    // Menüyü tekrar göster
    await mainMenu()
  } catch (error) {
    console.error("Hata:", error)
    rl.close()
    process.exit(1)
  }
}

// Programı başlat
console.log("Kullanıcı Yönetim Sistemi başlatılıyor...")
console.log("Veritabanı bağlantısı kontrol ediliyor...")

checkDatabaseConnection().then((isConnected) => {
  if (isConnected) {
    mainMenu()
  } else {
    console.error("Veritabanı bağlantısı kurulamadı. Program sonlandırılıyor.")
    rl.close()
    process.exit(1)
  }
})
