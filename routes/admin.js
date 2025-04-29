import express from "express"
import { pool } from "../config/database.js"

const router = express.Router()

// Admin ana sayfası
router.get("/", async (req, res) => {
  try {
    // Tüm ilanları getir
    const [ilanlar] = await pool.query(`
      SELECT * FROM ilanlar 
      ORDER BY baslangic_tarihi DESC
    `)

    res.render("admin/dashboard", {
      title: "Admin Paneli",
      ilanlar,
    })
  } catch (error) {
    console.error("İlanları getirme hatası:", error)
    req.flash("error_msg", "İlanlar yüklenirken bir hata oluştu.")
    res.render("admin/dashboard", {
      title: "Admin Paneli",
      ilanlar: [],
    })
  }
})

// Yeni ilan ekleme sayfası
router.get("/ilan-ekle", (req, res) => {
  res.render("admin/ilan-ekle", { title: "Yeni İlan Ekle" })
})

// Yeni ilan ekleme işlemi
router.post("/ilan-ekle", async (req, res) => {
  try {
    const { baslik, kadro_turu, birim, anabilim_dali, baslangic_tarihi, bitis_tarihi, durum, aciklama } = req.body

    // İlan bilgilerini veritabanına kaydet
    const [result] = await pool.query(
      `
      INSERT INTO ilanlar (baslik, kadro_turu, birim, anabilim_dali, baslangic_tarihi, bitis_tarihi, durum, aciklama, olusturma_tarihi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
      [baslik, kadro_turu, birim, anabilim_dali, baslangic_tarihi, bitis_tarihi, durum, aciklama],
    )

    const ilanId = result.insertId

    // Yeni eklenen ilanı getir
    const [ilanlar] = await pool.query("SELECT * FROM ilanlar WHERE id = ?", [ilanId])
    const ilan = ilanlar[0]

    // Bildirim servisleri kaldırıldı

    req.flash("success_msg", "İlan başarıyla eklendi.")
    res.redirect("/admin")
  } catch (error) {
    console.error("İlan ekleme hatası:", error)
    req.flash("error_msg", "İlan eklenirken bir hata oluştu.")
    res.redirect("/admin/ilan-ekle")
  }
})

// İlan düzenleme sayfası
router.get("/ilan-duzenle/:id", async (req, res) => {
  try {
    const ilanId = req.params.id

    // İlan detaylarını getir
    const [ilanlar] = await pool.query("SELECT * FROM ilanlar WHERE id = ?", [ilanId])

    if (ilanlar.length === 0) {
      req.flash("error_msg", "İlan bulunamadı.")
      return res.redirect("/admin")
    }

    const ilan = ilanlar[0]

    res.render("admin/ilan-duzenle", {
      title: "İlan Düzenle",
      ilan,
    })
  } catch (error) {
    console.error("İlan detayı getirme hatası:", error)
    req.flash("error_msg", "İlan detayları yüklenirken bir hata oluştu.")
    res.redirect("/admin")
  }
})

// İlan düzenleme işlemi
router.put("/ilan-duzenle/:id", async (req, res) => {
  try {
    const ilanId = req.params.id
    const { baslik, kadro_turu, birim, anabilim_dali, baslangic_tarihi, bitis_tarihi, durum, aciklama } = req.body

    // İlanın önceki durumunu kontrol et
    const [eskiIlanlar] = await pool.query("SELECT durum FROM ilanlar WHERE id = ?", [ilanId])
    const eskiDurum = eskiIlanlar[0].durum

    // İlan bilgilerini güncelle
    await pool.query(
      `
      UPDATE ilanlar 
      SET baslik = ?, kadro_turu = ?, birim = ?, anabilim_dali = ?, baslangic_tarihi = ?, bitis_tarihi = ?, durum = ?, aciklama = ?
      WHERE id = ?
    `,
      [baslik, kadro_turu, birim, anabilim_dali, baslangic_tarihi, bitis_tarihi, durum, aciklama, ilanId],
    )

    // Bildirim servisleri kaldırıldı

    req.flash("success_msg", "İlan başarıyla güncellendi.")
    res.redirect("/admin")
  } catch (error) {
    console.error("İlan güncelleme hatası:", error)
    req.flash("error_msg", "İlan güncellenirken bir hata oluştu.")
    res.redirect(`/admin/ilan-duzenle/${req.params.id}`)
  }
})

// İlan silme işlemi
router.delete("/ilan-sil/:id", async (req, res) => {
  try {
    const ilanId = req.params.id

    // İlanı sil
    await pool.query("DELETE FROM ilanlar WHERE id = ?", [ilanId])

    req.flash("success_msg", "İlan başarıyla silindi.")
    res.redirect("/admin")
  } catch (error) {
    console.error("İlan silme hatası:", error)
    req.flash("error_msg", "İlan silinirken bir hata oluştu.")
    res.redirect("/admin")
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
      return res.redirect("/admin")
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

    res.render("admin/ilan-basvurulari", {
      title: "İlan Başvuruları",
      ilan,
      basvurular,
    })
  } catch (error) {
    console.error("İlan başvurularını getirme hatası:", error)
    req.flash("error_msg", "İlan başvuruları yüklenirken bir hata oluştu.")
    res.redirect("/admin")
  }
})

export default router
