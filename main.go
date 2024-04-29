package main

import (
    "html/template"
    "io"
    "log"
    "net/http"

    "github.com/gorilla/sessions"
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
    "github.com/labstack/echo-contrib/session"
    "fbstocks/internal/config"
    "fbstocks/internal/handlers"
)

type Template struct {
    templates *template.Template
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
    return t.templates.ExecuteTemplate(w, name, data)
}

func main() {
    e := echo.New()

    e.Use(middleware.Logger())
    e.Use(middleware.Recover())
    e.Static("/", "public")
    e.GET("/login", func(c echo.Context) error {
      return c.Render(http.StatusOK, "login.html", nil)
    })

    // 設定をロード
    conf, sessionSecret, err := config.LoadConfig("./internal/config/config.json")
    if err != nil {
        log.Fatalf("Failed to load configuration: %v", err)
    }

    // セッションストアの生成とミドルウェアの設定
    store := sessions.NewCookieStore([]byte(sessionSecret))
    e.Use(session.Middleware(store))

    // テンプレートエンジンの設定
    t := &Template{
        templates: template.Must(template.ParseGlob("views/*.html")),
    }
    e.Renderer = t

    // ルーティングを設定
    e.GET("/api/auth/google", func(c echo.Context) error {
        return handlers.HandleGoogleAuth(c, conf) // handlers. を付ける
    })
    e.GET("/api/auth/google/callback", func(c echo.Context) error {
        return handlers.HandleGoogleCallback(c, conf, store) // ここでセッションストアを渡す
    })
    e.GET("/api/dashboard", handlers.DashboardHandler) // handlers. を付ける、関数を直接ルートに割り当てる

    // サーバーを開始
    e.Logger.Fatal(e.Start(":1234"))
}

