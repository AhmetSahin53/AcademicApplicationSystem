import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import { pool } from "../config/database.js"
import { uploadS3 } from "../config/s3.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Jüri ana sayfası
router.get("/", async (req, res) => {
  try {
    const juriId = req.session.user.id

    // Jüri üyesinin atandığı ilanları getir
    const [ilanlar] = await pool.query(
      `
      SELECT i.*, j.ekleme_tarihi as atanma_tarihi
      FROM ilanlar i
      JOIN ilan_juri_uyeleri j ON i.id = j.ilan_id
      WHERE j.juri_id = ?
      ORDER BY i.baslangic_tarihi DESC
    `,
      [juriId],
    )

    res.render("juri/dashboard", {
      title: "Jüri Paneli",
      ilanlar,
    })
  } catch (error) {
    console.error("İlanları getirme hatası:", error)
    req.flash("error_msg", "İlanlar yüklenirken bir hata oluştu.")
    res.render("juri/dashboard", {
      title: "Jüri Paneli",
      ilanlar: [],
    })
  }
})

// İlan başvurularını görüntüleme
router.get("/ilan-basvurulari/:id", async (req, res) => {
  try {
    const ilanId = req.params.id
    const juriId = req.session.user.id

    // Jüri üyesinin bu ilana atanıp atanmadığını kontrol et
    const [juriAtama] = await pool.query("SELECT * FROM ilan_juri_uyeleri WHERE ilan_id = ? AND juri_id = ?", [
      ilanId,
      juriId,
    ])

    if (juriAtama.length === 0) {
      req.flash("error_msg", "Bu ilana jüri üyesi olarak atanmadınız.")
      return res.redirect("/juri")
    }

    // İlan detaylarını getir
    const [ilanlar] = await pool.query("SELECT * FROM ilanlar WHERE id = ?", [ilanId])

    if (ilanlar.length === 0) {
      req.flash("error_msg", "İlan bulunamadı.")
      return res.redirect("/juri")
    }

    const ilan = ilanlar[0]

    // İlana yapılan başvuruları getir
    const [basvurular] = await pool.query(
      `
      SELECT b.*, u.name as aday_adi
      FROM basvurular b
      JOIN users u ON b.aday_id = u.id
      WHERE b.ilan_id = ?
      ORDER BY b.basvuru_tarihi DESC
    `,
      [ilanId],
    )

    // Jüri değerlendirmelerini getir
    const [degerlendirmeler] = await pool.query(
      "SELECT * FROM juri_degerlendirmeleri WHERE juri_id = ? AND basvuru_id IN (SELECT id FROM basvurular WHERE ilan_id = ?)",
      [juriId, ilanId],
    )

    // Değerlendirme durumlarını başvurulara ekle
    const basvurularWithStatus = basvurular.map((basvuru) => {
      const degerlendirme = degerlendirmeler.find((d) => d.basvuru_id === basvuru.id)
      return {
        ...basvuru,
        degerlendirme_durumu: degerlendirme ? "Tamamlandı" : "Beklemede",
        degerlendirme: degerlendirme,
      }
    })

    res.render("juri/ilan-basvurulari", {
      title: "İlan Başvuruları",
      ilan,
      basvurular: basvurularWithStatus,
    })
  } catch (error) {
    console.error("İlan başvurularını getirme hatası:", error)
    req.flash("error_msg", "İlan başvuruları yüklenirken bir hata oluştu.")
    res.redirect("/juri")
  }
})

// Başvuru detayı
router.get("/basvuru-detay/:id", async (req, res) => {
  try {
    const basvuruId = req.params.id
    const juriId = req.session.user.id

    // Başvuru detaylarını getir
    const [basvurular] = await pool.query(
      `
      SELECT b.*, i.baslik as ilan_baslik, i.kadro_turu, u.name as aday_adi
      FROM basvurular b
      JOIN ilanlar i ON b.ilan_id = i.id
      JOIN users u ON b.aday_id = u.id
      WHERE b.id = ?
    `,
      [basvuruId],
    )

    if (basvurular.length === 0) {
      req.flash("error_msg", "Başvuru bulunamadı.")
      return res.redirect("/juri")
    }

    const basvuru = basvurular[0]

    // Jüri üyesinin bu ilana atanıp atanmadığını kontrol et
    const [juriAtama] = await pool.query("SELECT * FROM ilan_juri_uyeleri WHERE ilan_id = ? AND juri_id = ?", [
      basvuru.ilan_id,
      juriId,
    ])

    if (juriAtama.length === 0) {
      req.flash("error_msg", "Bu başvuruyu değerlendirme yetkiniz bulunmamaktadır.")
      return res.redirect("/juri")
    }

    // Başvuru belgelerini getir
    const [belgeler] = await pool.query("SELECT * FROM basvuru_belgeleri WHERE basvuru_id = ?", [basvuruId])

    // Yayın bilgilerini getir
    const [yayinlar] = await pool.query("SELECT * FROM basvuru_yayinlar WHERE basvuru_id = ?", [basvuruId])

    // Atıf bilgilerini getir
    const [atiflar] = await pool.query("SELECT * FROM basvuru_atiflar WHERE basvuru_id = ?", [basvuruId])

    // Konferans bilgilerini getir
    const [konferanslar] = await pool.query("SELECT * FROM basvuru_konferanslar WHERE basvuru_id = ?", [basvuruId])

    // Jüri değerlendirmesini getir
    const [degerlendirmeler] = await pool.query(
      "SELECT * FROM juri_degerlendirmeleri WHERE basvuru_id = ? AND juri_id = ?",
      [basvuruId, juriId],
    )

    const degerlendirme = degerlendirmeler.length > 0 ? degerlendirmeler[0] : null

    res.render("juri/basvuru-detay", {
      title: "Başvuru Detayı",
      basvuru,
      belgeler,
      yayinlar,
      atiflar,
      konferanslar,
      degerlendirme,
    })
  } catch (error) {
    console.error("Başvuru detayı getirme hatası:", error)
    req.flash("error_msg", "Başvuru detayları yüklenirken bir hata oluştu.")
    res.redirect("/juri")
  }
})

// Değerlendirme gönderme
router.post("/degerlendirme/:basvuruId", uploadS3.single("rapor"), async (req, res) => {
  try {
    const basvuruId = req.params.basvuruId
    const juriId = req.session.user.id
    const { degerlendirme_metni, sonuc } = req.body

    // Başvuru bilgilerini getir
    const [basvurular] = await pool.query("SELECT ilan_id FROM basvurular WHERE id = ?", [basvuruId])

    if (basvurular.length === 0) {
      req.flash("error_msg", "Başvuru bulunamadı.")
      return res.redirect("/juri")
    }

    const ilanId = basvurular[0].ilan_id

    // Jüri üyesinin bu ilana atanıp atanmadığını kontrol et
    const [juriAtama] = await pool.query("SELECT * FROM ilan_juri_uyeleri WHERE ilan_id = ? AND juri_id = ?", [
      ilanId,
      juriId,
    ])

    if (juriAtama.length === 0) {
      req.flash("error_msg", "Bu başvuruyu değerlendirme yetkiniz bulunmamaktadır.")
      return res.redirect("/juri")
    }

    // Daha önce değerlendirme yapılmış mı kontrol et
    const [degerlendirmeler] = await pool.query(
      "SELECT * FROM juri_degerlendirmeleri WHERE basvuru_id = ? AND juri_id = ?",
      [basvuruId, juriId],
    )

    let rapor_yolu = null
    if (req.file) {
      rapor_yolu = req.file.location
    }

    if (degerlendirmeler.length > 0) {
      // Mevcut değerlendirmeyi güncelle
      await pool.query(
        `
        UPDATE juri_degerlendirmeleri 
        SET degerlendirme_metni = ?, sonuc = ?, rapor_yolu = COALESCE(?, rapor_yolu), guncelleme_tarihi = NOW()
        WHERE basvuru_id = ? AND juri_id = ?
      `,
        [degerlendirme_metni, sonuc, rapor_yolu, basvuruId, juriId],
      )
    } else {
      // Yeni değerlendirme ekle
      await pool.query(
        `
        INSERT INTO juri_degerlendirmeleri (basvuru_id, juri_id, degerlendirme_metni, sonuc, rapor_yolu, degerlendirme_tarihi)
        VALUES (?, ?, ?, ?, ?, NOW())
      `,
        [basvuruId, juriId, degerlendirme_metni, sonuc, rapor_yolu],
      )
    }

    req.flash("success_msg", "Değerlendirmeniz başarıyla kaydedildi.")
    res.redirect(`/juri/ilan-basvurulari/${ilanId}`)
  } catch (error) {
    console.error("Değerlendirme gönderme hatası:", error)
    req.flash("error_msg", "Değerlendirme gönderilirken bir hata oluştu.")
    res.redirect(`/juri/basvuru-detay/${req.params.basvuruId}`)
  }
})

export default router
