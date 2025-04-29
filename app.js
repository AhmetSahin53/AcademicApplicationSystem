import express from "express"
import path from "path"
import cookieParser from "cookie-parser"
import session from "express-session"
import flash from "connect-flash"
import { fileURLToPath } from "url"
import methodOverride from "method-override"
import dotenv from "dotenv"

// Çevre değişkenlerini yükle
dotenv.config()

// Veritabanı bağlantısı
import { testConnection } from "./config/database.js"

// Routes
import indexRouter from "./routes/index.js"
import authRouter from "./routes/auth.js"
import adayRouter from "./routes/aday.js"
import adminRouter from "./routes/admin.js"
import yoneticiRouter from "./routes/yonetici.js"
import juriRouter from "./routes/juri.js"

// Middlewares
import { checkAuthenticated } from "./middlewares/auth.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// View engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))
app.use(methodOverride("_method"))

// Session setup
app.use(
  session({
    secret: "akademik-basvuru-sistemi",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }, // 1 hour
  }),
)

// Flash messages
app.use(flash())

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg")
  res.locals.error_msg = req.flash("error_msg")
  res.locals.error = req.flash("error")
  res.locals.user = req.session.user || null
  next()
})

// Routes
app.use("/", indexRouter)
app.use("/auth", authRouter)
app.use("/aday", checkAuthenticated("aday"), adayRouter)
app.use("/admin", checkAuthenticated("admin"), adminRouter)
app.use("/yonetici", checkAuthenticated("yonetici"), yoneticiRouter)
app.use("/juri", checkAuthenticated("juri"), juriRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).render("error", {
    message: "Sayfa bulunamadı",
    error: { status: 404 },
  })
})

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).render("error", {
    message: err.message,
    error: process.env.NODE_ENV === "development" ? err : {},
  })
})

const PORT = process.env.PORT || 3000

// Veritabanı bağlantısını test et ve sunucuyu başlat
async function startServer() {
  try {
    // Veritabanı bağlantısını test et
    const dbConnected = await testConnection()

    if (dbConnected) {
      console.log("Veritabanı bağlantısı başarılı!")
    } else {
      console.error("Veritabanı bağlantısı başarısız! Lütfen .env dosyasındaki veritabanı ayarlarını kontrol edin.")
    }

    // Sunucuyu başlat
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Veritabanı durumu: ${dbConnected ? "Bağlı ✅" : "Bağlantı Hatası ❌"}`)
    })
  } catch (error) {
    console.error("Sunucu başlatılırken hata oluştu:", error)
  }
}

startServer()

export default app
