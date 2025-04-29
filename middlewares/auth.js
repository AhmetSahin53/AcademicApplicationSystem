// Kullanıcı kimlik doğrulama middleware'i
function checkAuthenticated(role) {
  return (req, res, next) => {
    if (req.session.user) {
      // Kullanıcı oturum açmış
      if (!role || req.session.user.role === role) {
        // Rol kontrolü başarılı veya rol kontrolü gerekmiyor
        return next()
      } else {
        // Kullanıcının rolü uygun değil
        req.flash("error_msg", "Bu sayfaya erişim yetkiniz bulunmamaktadır.")
        return res.redirect("/")
      }
    } else {
      // Kullanıcı oturum açmamış
      req.flash("error_msg", "Lütfen önce giriş yapın.")
      return res.redirect("/auth/login")
    }
  }
}

// Kullanıcı oturum açmamışsa erişime izin veren middleware
function checkNotAuthenticated(req, res, next) {
  if (req.session.user) {
    // Kullanıcı zaten oturum açmış, rolüne göre yönlendir
    const role = req.session.user.role
    return res.redirect(`/${role}`)
  }
  next()
}

export { checkAuthenticated, checkNotAuthenticated }
