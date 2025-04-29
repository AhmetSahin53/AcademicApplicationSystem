import express from "express"
const router = express.Router()

// Ana sayfa
router.get("/", (req, res) => {
  res.render("index", { title: "Akademik Personel Başvuru Sistemi" })
})

export default router
