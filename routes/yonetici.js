import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { pool } from "../config/database.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Dosya yükleme için multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "uploads", "juri-raporlari")

    // Klasör oluştur
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Sadece .pdf, .doc ve .docx uzantılı dosyalar yüklenebilir."))
    }
  },
})

// Yönetici ana sayfası
router.get("/", async (req, res) => {
  try {
    // Aktif ilanları getir
    const [ilanlar] = await pool.query(`
      SELECT i.*, COUNT(b.id) as basvuru_sayisi
      FROM ilanlar i
      LEFT JOIN basvurular b ON i.id = b.ilan_id
      GROUP BY i.id
      ORDER BY i.baslangic_tarihi DESC
    `)

    res.render("yonetici/dashboard", {
      title: "Yönetici Paneli",
      ilanlar,
    })
  } catch (error) {
    console.error("İlanları getirme hatası:", error)
    req.flash("error_msg", "İlanlar yüklenirken bir hata oluştu.")
    res.render("yonetici/dashboard", {
      title: "Yönetici Paneli",
      ilanlar: [],
    })
  }
})

// İlan kriterleri belirleme sayfası
router.get("/ilan-kriterleri/:id", async (req, res) => {
  try {
    const ilanId = req.params.id

    // İlan detaylarını getir
    const [ilanlar] = await pool.query("SELECT * FROM ilanlar WHERE id = ?", [ilanId])

    if (ilanlar.length === 0) {
      req.flash("error_msg", "İlan bulunamadı.")
      return res.redirect("/yonetici")
    }

    const ilan = ilanlar[0]

    // İlan kriterlerini getir
    const [kriterler] = await pool.query("SELECT * FROM ilan_kriterleri WHERE ilan_id = ?", [ilanId])

    res.render("yonetici/ilan-kriterleri", {
      title: "İlan Kriterleri",
      ilan,
      kriterler,
    })
  } catch (error) {
    console.error("İlan kriterleri getirme hatası:", error)
    req.flash("error_msg", "İlan kriterleri yüklenirken bir hata oluştu.")
    res.redirect("/yonetici")
  }
})

// İlan kriterleri kaydetme
router.post("/ilan-kriterleri/:id", async (req, res) => {
  try {
    const ilanId = req.params.id
    const { kriter_tipi, kriter_aciklama, min_puan, min_adet } = req.body

    console.log("Gelen kriter verileri:", {
      ilanId,
      kriter_tipi,
      kriter_aciklama,
      min_puan,
      min_adet,
    })

    // Önce mevcut kriterleri sil
    await pool.query("DELETE FROM ilan_kriterleri WHERE ilan_id = ?", [ilanId])

    // Yeni kriterleri ekle
    if (Array.isArray(kriter_tipi)) {
      for (let i = 0; i < kriter_tipi.length; i++) {
        if (kriter_tipi[i] && kriter_aciklama[i]) {
          await pool.query(
            `
            INSERT INTO ilan_kriterleri (ilan_id, kriter_tipi, kriter_aciklama, min_puan, min_adet)
            VALUES (?, ?, ?, ?, ?)
          `,
            [ilanId, kriter_tipi[i], kriter_aciklama[i], min_puan[i] || 0, min_adet[i] || 0],
          )
        }
      }
      console.log(`${kriter_tipi.length} adet kriter başarıyla eklendi.`)
    } else if (kriter_tipi) {
      await pool.query(
        `
        INSERT INTO ilan_kriterleri (ilan_id, kriter_tipi, kriter_aciklama, min_puan, min_adet)
        VALUES (?, ?, ?, ?, ?)
      `,
        [ilanId, kriter_tipi, kriter_aciklama, min_puan || 0, min_adet || 0],
      )
      console.log("Tek kriter başarıyla eklendi.")
    }

    req.flash("success_msg", "İlan kriterleri başarıyla kaydedildi.")
    res.redirect("/yonetici")
  } catch (error) {
    console.error("İlan kriterleri kaydetme hatası:", error)
    req.flash("error_msg", "İlan kriterleri kaydedilirken bir hata oluştu.")
    res.redirect(`/yonetici/ilan-kriterleri/${req.params.id}`)
  }
})

// İlan başvurularını görüntüleme
router.get("/ilan-basvurulari/:id", async (req, res) => {
  try {
    const ilanId = req.params.id

    // İlan detaylarını getir
    const [ilanlar] = await pool.query("SELECT * FROM ilanlar WHERE id = ?", [ilanId])

    if (ilanlar.length === 0) {
      req.flash("error_msg", "İlan bulunamadı.")
      return res.redirect("/yonetici")
    }

    const ilan = ilanlar[0]

    // İlana yapılan başvuruları getir
    const [basvurular] = await pool.query(
      `
      SELECT b.*, u.name as aday_adi, u.tc_no as aday_tc
      FROM basvurular b
      JOIN users u ON b.aday_id = u.id
      WHERE b.ilan_id = ?
      ORDER BY b.basvuru_tarihi DESC
    `,
      [ilanId],
    )

    // Jüri üyelerini getir
    const [juriUyeleri] = await pool.query(
      `
      SELECT j.*, u.name as juri_adi
      FROM ilan_juri_uyeleri j
      JOIN users u ON j.juri_id = u.id
      WHERE j.ilan_id = ?
    `,
      [ilanId],
    )

    // Potansiyel jüri üyelerini getir
    const [potansiyelJuriUyeleri] = await pool.query(`
      SELECT id, name, tc_no
      FROM users
      WHERE role = 'juri'
      ORDER BY name
    `)

    res.render("yonetici/ilan-basvurulari", {
      title: "İlan Başvuruları",
      ilan,
      basvurular,
      juriUyeleri,
      potansiyelJuriUyeleri,
    })
  } catch (error) {
    console.error("İlan başvurularını getirme hatası:", error)
    req.flash("error_msg", "İlan başvuruları yüklenirken bir hata oluştu.")
    res.redirect("/yonetici")
  }
})

// Jüri üyesi ekleme
router.post("/juri-ekle/:ilanId", async (req, res) => {
  try {
    const ilanId = req.params.ilanId
    const { juri_id } = req.body

    // Jüri üyesini ekle
    await pool.query(
      `
      INSERT INTO ilan_juri_uyeleri (ilan_id, juri_id, ekleme_tarihi)
      VALUES (?, ?, NOW())
    `,
      [ilanId, juri_id],
    )

    req.flash("success_msg", "Jüri üyesi başarıyla eklendi.")
    res.redirect(`/yonetici/ilan-basvurulari/${ilanId}`)
  } catch (error) {
    console.error("Jüri üyesi ekleme hatası:", error)
    req.flash("error_msg", "Jüri üyesi eklenirken bir hata oluştu.")
    res.redirect(`/yonetici/ilan-basvurulari/${req.params.ilanId}`)
  }
})

// Jüri üyesi silme
router.delete("/juri-sil/:ilanId/:juriId", async (req, res) => {
  try {
    const { ilanId, juriId } = req.params

    // Jüri üyesini sil
    await pool.query("DELETE FROM ilan_juri_uyeleri WHERE ilan_id = ? AND juri_id = ?", [ilanId, juriId])

    req.flash("success_msg", "Jüri üyesi başarıyla silindi.")
    res.redirect(`/yonetici/ilan-basvurulari/${ilanId}`)
  } catch (error) {
    console.error("Jüri üyesi silme hatası:", error)
    req.flash("error_msg", "Jüri üyesi silinirken bir hata oluştu.")
    res.redirect(`/yonetici/ilan-basvurulari/${req.params.ilanId}`)
  }
})

// Başvuru detayı
router.get("/basvuru-detay/:id", async (req, res) => {
  try {
    const basvuruId = req.params.id

    // Başvuru detaylarını getir
    const [basvurular] = await pool.query(
      `
      SELECT b.*, i.baslik as ilan_baslik, i.kadro_turu, u.name as aday_adi, u.tc_no as aday_tc
      FROM basvurular b
      JOIN ilanlar i ON b.ilan_id = i.id
      JOIN users u ON b.aday_id = u.id
      WHERE b.id = ?
    `,
      [basvuruId],
    )

    if (basvurular.length === 0) {
      req.flash("error_msg", "Başvuru bulunamadı.")
      return res.redirect("/yonetici")
    }

    const basvuru = basvurular[0]

    // Başvuru belgelerini getir
    const [belgeler] = await pool.query("SELECT * FROM basvuru_belgeleri WHERE basvuru_id = ?", [basvuruId])

    // Yayın bilgilerini getir
    const [yayinlar] = await pool.query("SELECT * FROM basvuru_yayinlar WHERE basvuru_id = ?", [basvuruId])

    // Atıf bilgilerini getir
    const [atiflar] = await pool.query("SELECT * FROM basvuru_atiflar WHERE basvuru_id = ?", [basvuruId])

    // Konferans bilgilerini getir
    const [konferanslar] = await pool.query("SELECT * FROM basvuru_konferanslar WHERE basvuru_id = ?", [basvuruId])

    // Jüri değerlendirmelerini getir
    const [degerlendirmeler] = await pool.query(
      `
      SELECT d.*, u.name as juri_adi
      FROM juri_degerlendirmeleri d
      JOIN users u ON d.juri_id = u.id
      WHERE d.basvuru_id = ?
    `,
      [basvuruId],
    )

    res.render("yonetici/basvuru-detay", {
      title: "Başvuru Detayı",
      basvuru,
      belgeler,
      yayinlar,
      atiflar,
      konferanslar,
      degerlendirmeler,
    })
  } catch (error) {
    console.error("Başvuru detayı getirme hatası:", error)
    req.flash("error_msg", "Başvuru detayları yüklenirken bir hata oluştu.")
    res.redirect("/yonetici")
  }
})

// Başvuru sonucu güncelleme
router.post("/basvuru-sonuc/:id", async (req, res) => {
  try {
    const basvuruId = req.params.id
    const { durum, sonuc_aciklama } = req.body

    // Başvuru durumunu güncelle
    await pool.query(
      `
      UPDATE basvurular 
      SET durum = ?, sonuc_aciklama = ?, sonuc_tarihi = NOW()
      WHERE id = ?
    `,
      [durum, sonuc_aciklama, basvuruId],
    )

    // Başvuru bilgilerini getir
    const [basvurular] = await pool.query("SELECT ilan_id FROM basvurular WHERE id = ?", [basvuruId])
    const ilanId = basvurular[0].ilan_id

    req.flash("success_msg", "Başvuru sonucu başarıyla güncellendi.")
    res.redirect(`/yonetici/ilan-basvurulari/${ilanId}`)
  } catch (error) {
    console.error("Başvuru sonucu güncelleme hatası:", error)
    req.flash("error_msg", "Başvuru sonucu güncellenirken bir hata oluştu.")
    res.redirect(`/yonetici/basvuru-detay/${req.params.id}`)
  }
})

export default router
