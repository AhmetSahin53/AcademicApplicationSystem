import express from "express"
import bcrypt from "bcrypt"
import { pool } from "../config/database.js"
import { checkNotAuthenticated } from "../middlewares/auth.js"

const router = express.Router()

// Login sayfası
router.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("auth/login", { title: "Giriş Yap" })
})

// Login işlemi
router.post("/login", checkNotAuthenticated, async (req, res) => {
  try {
    const { tcno, password } = req.body

    // TC kimlik numarası ve şifre kontrolü
    if (!tcno || !password) {
      req.flash("error_msg", "Lütfen tüm alanları doldurun.")
      return res.redirect("/auth/login")
    }

    console.log(`Giriş denemesi: TC No: ${tcno}`)

    // Veritabanından kullanıcıyı sorgula
    const [users] = await pool.query("SELECT * FROM users WHERE tc_no = ?", [tcno])

    console.log(`Bulunan kullanıcı sayısı: ${users.length}`)

    if (users.length === 0) {
      console.log(`Kullanıcı bulunamadı: ${tcno}`)
      req.flash("error_msg", "TC Kimlik Numarası veya şifre hatalı.")
      return res.redirect("/auth/login")
    }

    const user = users[0]
    console.log(`Kullanıcı bulundu: ${user.name}, Rol: ${user.role}`)

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, user.password)
    console.log(`Şifre eşleşmesi: ${isMatch}`)

    if (!isMatch) {
      req.flash("error_msg", "TC Kimlik Numarası veya şifre hatalı.")
      return res.redirect("/auth/login")
    }

    // Session'a kullanıcı bilgilerini kaydet
    req.session.user = {
      id: user.id,
      tcno: user.tc_no,
      name: user.name,
      role: user.role,
    }

    // Kullanıcı rolüne göre yönlendirme
    req.flash("success_msg", "Başarıyla giriş yaptınız.")
    res.redirect(`/${user.role}`)
  } catch (error) {
    console.error("Login hatası:", error)
    req.flash("error_msg", "Giriş yapılırken bir hata oluştu.")
    res.redirect("/auth/login")
  }
})

// Kayıt sayfası
router.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("auth/register", { title: "Aday Kayıt" })
})

// Kayıt işlemi
router.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const { tcno, name, email, password, password2 } = req.body

    // Validasyon
    const errors = []

    // Tüm alanların doldurulduğunu kontrol et
    if (!tcno || !name || !email || !password || !password2) {
      errors.push({ msg: "Lütfen tüm alanları doldurun." })
    }

    // TC Kimlik Numarası kontrolü
    if (tcno.length !== 11 || !/^\d+$/.test(tcno)) {
      errors.push({ msg: "TC Kimlik Numarası 11 haneli olmalı ve sadece rakamlardan oluşmalıdır." })
    }

    // Şifre uzunluğu kontrolü
    if (password.length < 6) {
      errors.push({ msg: "Şifre en az 6 karakter olmalıdır." })
    }

    // Şifrelerin eşleştiğini kontrol et
    if (password !== password2) {
      errors.push({ msg: "Şifreler eşleşmiyor." })
    }

    // Hata varsa, kayıt formunu tekrar göster
    if (errors.length > 0) {
      return res.render("auth/register", {
        title: "Aday Kayıt",
        errors,
        tcno,
        name,
        email,
      })
    }

    // TC Kimlik Numarasının daha önce kullanılıp kullanılmadığını kontrol et
    const [existingUsers] = await pool.query("SELECT * FROM users WHERE tc_no = ?", [tcno])

    if (existingUsers.length > 0) {
      req.flash("error_msg", "Bu TC Kimlik Numarası ile daha önce kayıt yapılmış.")
      return res.redirect("/auth/register")
    }

    // E-posta adresinin daha önce kullanılıp kullanılmadığını kontrol et
    const [existingEmails] = await pool.query("SELECT * FROM users WHERE email = ?", [email])

    if (existingEmails.length > 0) {
      req.flash("error_msg", "Bu e-posta adresi ile daha önce kayıt yapılmış.")
      return res.redirect("/auth/register")
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10)

    // Kullanıcıyı veritabanına kaydet
    const [result] = await pool.query("INSERT INTO users (tc_no, name, email, password, role) VALUES (?, ?, ?, ?, ?)", [
      tcno,
      name,
      email,
      hashedPassword,
      "aday",
    ])

    console.log(`Yeni kullanıcı kaydedildi: ${name}, ID: ${result.insertId}`)

    req.flash("success_msg", "Başarıyla kayıt oldunuz. Şimdi giriş yapabilirsiniz.")
    res.redirect("/auth/login")
  } catch (error) {
    console.error("Kayıt hatası:", error)
    req.flash("error_msg", "Kayıt olurken bir hata oluştu.")
    res.redirect("/auth/register")
  }
})

// Çıkış işlemi
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Oturum kapatma hatası:", err)
    }
    res.redirect("/")
  })
})

export default router
