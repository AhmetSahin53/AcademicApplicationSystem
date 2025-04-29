import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import { pool } from "../config/database.js"
import { uploadS3 } from "../config/s3.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Aday ana sayfası
router.get("/", async (req, res) => {
  try {
    // Aktif ilanları getir (sadece durum = 'Aktif' olanlar)
    const [ilanlar] = await pool.query(`
      SELECT * FROM ilanlar 
      WHERE durum = 'Aktif'
      AND bitis_tarihi >= CURDATE() 
      ORDER BY baslangic_tarihi DESC
    `)

    // Debug için konsola yazdıralım
    console.log(`Adaya gösterilen ilan sayısı: ${ilanlar.length}`)
    ilanlar.forEach((ilan) => {
      console.log(`İlan ID: ${ilan.id}, Başlık: ${ilan.baslik}, Durum: ${ilan.durum}`)
    })

    res.render("aday/dashboard", {
      title: "Aday Paneli",
      ilanlar,
    })
  } catch (error) {
    console.error("İlanları getirme hatası:", error)
    req.flash("error_msg", "İlanlar yüklenirken bir hata oluştu.")
    res.render("aday/dashboard", {
      title: "Aday Paneli",
      ilanlar: [],
    })
  }
})

// İlan detayı
router.get("/ilan/:id", async (req, res) => {
  try {
    const ilanId = req.params.id

    // İlan detaylarını getir
    const [ilanlar] = await pool.query("SELECT * FROM ilanlar WHERE id = ? AND durum = 'Aktif'", [ilanId])

    // Debug için konsola yazdıralım
    console.log(`İlan detayı sorgusu - İlan ID: ${ilanId}, Sonuç sayısı: ${ilanlar.length}`)
    if (ilanlar.length > 0) {
      console.log(`İlan durumu: ${ilanlar[0].durum}`)
    }

    if (ilanlar.length === 0) {
      req.flash("error_msg", "İlan bulunamadı veya aktif değil.")
      return res.redirect("/aday")
    }

    const ilan = ilanlar[0]

    // İlan kriterlerini getir
    const [kriterler] = await pool.query("SELECT * FROM ilan_kriterleri WHERE ilan_id = ?", [ilanId])

    // Adayın daha önce başvurusu var mı kontrol et
    const [basvurular] = await pool.query("SELECT * FROM basvurular WHERE ilan_id = ? AND aday_id = ?", [
      ilanId,
      req.session.user.id,
    ])

    const basvuru = basvurular.length > 0 ? basvurular[0] : null

    res.render("aday/ilan-detay", {
      title: ilan.baslik,
      ilan,
      kriterler,
      basvuru,
    })
  } catch (error) {
    console.error("İlan detayı getirme hatası:", error)
    req.flash("error_msg", "İlan detayları yüklenirken bir hata oluştu.")
    res.redirect("/aday")
  }
})

// Başvuru formu
router.get("/basvuru/:ilanId", async (req, res) => {
  try {
    const ilanId = req.params.ilanId

    // İlan detaylarını getir
    const [ilanlar] = await pool.query("SELECT * FROM ilanlar WHERE id = ? AND durum = 'Aktif'", [ilanId])

    // Debug için konsola yazdıral��m
    console.log(`Başvuru formu sorgusu - İlan ID: ${ilanId}, Sonuç sayısı: ${ilanlar.length}`)
    if (ilanlar.length > 0) {
      console.log(`İlan durumu: ${ilanlar[0].durum}`)
    }

    if (ilanlar.length === 0) {
      req.flash("error_msg", "İlan bulunamadı veya aktif değil.")
      return res.redirect("/aday")
    }

    const ilan = ilanlar[0]

    // İlan kriterlerini getir
    const [kriterler] = await pool.query("SELECT * FROM ilan_kriterleri WHERE ilan_id = ?", [ilanId])

    // Adayın daha önce başvurusu var mı kontrol et
    const [basvurular] = await pool.query("SELECT * FROM basvurular WHERE ilan_id = ? AND aday_id = ?", [
      ilanId,
      req.session.user.id,
    ])

    if (basvurular.length > 0) {
      req.flash("error_msg", "Bu ilana daha önce başvuru yaptınız.")
      return res.redirect(`/aday/ilan/${ilanId}`)
    }

    res.render("aday/basvuru-form", {
      title: "Başvuru Formu",
      ilan,
      kriterler,
    })
  } catch (error) {
    console.error("Başvuru formu getirme hatası:", error)
    req.flash("error_msg", "Başvuru formu yüklenirken bir hata oluştu.")
    res.redirect("/aday")
  }
})

// Başvuru gönderme
router.post("/basvuru/:ilanId", uploadS3.array("belgeler", 20), async (req, res) => {
  try {
    const ilanId = req.params.ilanId
    const adayId = req.session.user.id

    // İlanın aktif olup olmadığını kontrol et
    const [ilanlar] = await pool.query("SELECT * FROM ilanlar WHERE id = ? AND durum = 'Aktif'", [ilanId])

    // Debug için konsola yazdıralım
    console.log(`Başvuru gönderme sorgusu - İlan ID: ${ilanId}, Sonuç sayısı: ${ilanlar.length}`)
    if (ilanlar.length > 0) {
      console.log(`İlan durumu: ${ilanlar[0].durum}`)
    }

    if (ilanlar.length === 0) {
      req.flash("error_msg", "İlan bulunamadı veya aktif değil.")
      return res.redirect("/aday")
    }

    const { yayinlar, atiflar, konferanslar } = req.body

    // Yüklenen dosyaların bilgilerini al
    const dosyalar = req.files.map((file) => ({
      key: file.key,
      location: file.location,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    }))

    // Başvuruyu veritabanına kaydet
    const [result] = await pool.query(
      "INSERT INTO basvurular (ilan_id, aday_id, durum, basvuru_tarihi) VALUES (?, ?, ?, NOW())",
      [ilanId, adayId, "Beklemede"],
    )

    const basvuruId = result.insertId

    // Dosya bilgilerini veritabanına kaydet
    for (const dosya of dosyalar) {
      await pool.query(
        "INSERT INTO basvuru_belgeleri (basvuru_id, dosya_yolu, dosya_adi, dosya_tipi, dosya_boyutu) VALUES (?, ?, ?, ?, ?)",
        [basvuruId, dosya.location, dosya.originalname, dosya.mimetype, dosya.size],
      )
    }

    // Yayın bilgilerini kaydet
    if (yayinlar && Array.isArray(yayinlar)) {
      for (const yayin of yayinlar) {
        await pool.query(
          "INSERT INTO basvuru_yayinlar (basvuru_id, yayin_turu, yayin_bilgisi, baslica_yazar) VALUES (?, ?, ?, ?)",
          [basvuruId, yayin.tur, yayin.bilgi, yayin.baslica_yazar ? 1 : 0],
        )
      }
    }

    // Atıf bilgilerini kaydet
    if (atiflar && Array.isArray(atiflar)) {
      for (const atif of atiflar) {
        await pool.query("INSERT INTO basvuru_atiflar (basvuru_id, atif_bilgisi) VALUES (?, ?)", [basvuruId, atif])
      }
    }

    // Konferans bilgilerini kaydet
    if (konferanslar && Array.isArray(konferanslar)) {
      for (const konferans of konferanslar) {
        await pool.query("INSERT INTO basvuru_konferanslar (basvuru_id, konferans_bilgisi) VALUES (?, ?)", [
          basvuruId,
          konferans,
        ])
      }
    }

    req.flash("success_msg", "Başvurunuz başarıyla gönderildi.")
    res.redirect("/aday/basvurularim")
  } catch (error) {
    console.error("Başvuru gönderme hatası:", error)
    req.flash("error_msg", "Başvuru gönderilirken bir hata oluştu.")
    res.redirect(`/aday/basvuru/${req.params.ilanId}`)
  }
})

// Başvurularım sayfası
router.get("/basvurularim", async (req, res) => {
  try {
    const adayId = req.session.user.id

    // Adayın başvurularını getir
    const [basvurular] = await pool.query(
      `
      SELECT b.*, i.baslik as ilan_baslik, i.kadro_turu 
      FROM basvurular b
      JOIN ilanlar i ON b.ilan_id = i.id
      WHERE b.aday_id = ?
      ORDER BY b.basvuru_tarihi DESC
    `,
      [adayId],
    )

    res.render("aday/basvurularim", {
      title: "Başvurularım",
      basvurular,
    })
  } catch (error) {
    console.error("Başvuruları getirme hatası:", error)
    req.flash("error_msg", "Başvurularınız yüklenirken bir hata oluştu.")
    res.render("aday/basvurularim", {
      title: "Başvurularım",
      basvurular: [],
    })
  }
})

// Başvuru detayı
router.get("/basvuru-detay/:id", async (req, res) => {
  try {
    const basvuruId = req.params.id
    const adayId = req.session.user.id

    // Başvuru detaylarını getir
    const [basvurular] = await pool.query(
      `
      SELECT b.*, i.baslik as ilan_baslik, i.kadro_turu 
      FROM basvurular b
      JOIN ilanlar i ON b.ilan_id = i.id
      WHERE b.id = ? AND b.aday_id = ?
    `,
      [basvuruId, adayId],
    )

    if (basvurular.length === 0) {
      req.flash("error_msg", "Başvuru bulunamadı.")
      return res.redirect("/aday/basvurularim")
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

    res.render("aday/basvuru-detay", {
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
    res.redirect("/aday/basvurularim")
  }
})

export default router
