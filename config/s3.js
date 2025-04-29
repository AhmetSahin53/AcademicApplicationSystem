import { S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import multer from "multer"
import multerS3 from "multer-s3"
import dotenv from "dotenv"
import path from "path"

// Çevre değişkenlerini yükle
dotenv.config({ path: ".env.local" }) // veya kullanmak istediğiniz dosya adı

// AWS S3 konfigürasyonu
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

// S3 yükleme fonksiyonu - ACL olmadan
const s3Upload = async (file, folder, customFileName = null) => {
  try {
    // Dosya türünü belirle
    let fileType = "other"
    if (file.mimetype.startsWith("image/")) {
      fileType = "images"
    } else if (file.mimetype === "application/pdf") {
      fileType = "documents"
    } else if (file.mimetype.includes("word")) {
      fileType = "documents"
    } else if (file.mimetype.includes("excel") || file.mimetype.includes("spreadsheet")) {
      fileType = "spreadsheets"
    } else if (file.mimetype.includes("presentation") || file.mimetype.includes("powerpoint")) {
      fileType = "presentations"
    }

    // Klasör yapısını oluştur: uploads/user_id/file_type/
    const fullFolder = `${folder}/${fileType}`

    // Özel dosya adı verilmişse onu kullan, yoksa orijinal dosya adını kullan
    const fileName = customFileName || path.basename(file.originalname)
    const key = `${fullFolder}/${fileName}`

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    })

    const result = await upload.done()

    return {
      url: result.Location,
      key: key,
      bucket: process.env.AWS_S3_BUCKET_NAME,
    }
  } catch (error) {
    console.error("S3 yükleme hatası:", error)
    throw error
  }
}

// Multer S3 konfigürasyonu - ACL olmadan
const s3Storage = multerS3({
  s3: s3Client,
  bucket: process.env.AWS_S3_BUCKET_NAME,

  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const userId = req.session.user.id
    const userName = req.session.user.name.replace(/\s+/g, "_")

    // Dosya türünü belirle
    let fileType = "other"
    if (file.mimetype.startsWith("image/")) {
      fileType = "images"
    } else if (file.mimetype === "application/pdf") {
      fileType = "documents"
    } else if (file.mimetype.includes("word")) {
      fileType = "documents"
    } else if (file.mimetype.includes("excel") || file.mimetype.includes("spreadsheet")) {
      fileType = "spreadsheets"
    } else if (file.mimetype.includes("presentation") || file.mimetype.includes("powerpoint")) {
      fileType = "presentations"
    }

    // Dosya adını belirle - Kullanıcı adı ve dosya adını birleştir
    const originalName = file.originalname.replace(/\s+/g, "_")
    const fileNameParts = originalName.split(".")
    const extension = fileNameParts.pop()
    const baseName = fileNameParts.join(".")

    // Dosya adını oluştur: KullaniciAdi_DosyaAdi.uzanti
    const fileName = `${userName}_${baseName}.${extension}`

    const folder = `uploads/${userId}/${fileType}`
    cb(null, `${folder}/${fileName}`)
  },
})

// Dosya tipi kontrolü
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf|doc|docx/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error("Sadece .jpeg, .jpg, .png, .pdf, .doc ve .docx uzantılı dosyalar yüklenebilir."))
  }
}

// Multer S3 upload middleware
const uploadS3 = multer({
  storage: s3Storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
})

// Dosya URL'sini oluşturma fonksiyonu
const getFileUrl = (key) => {
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}

export { s3Client, s3Upload, uploadS3, getFileUrl }
