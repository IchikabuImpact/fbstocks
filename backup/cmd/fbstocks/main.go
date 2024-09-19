package main

import (
    "database/sql"
    "html/template"
    "io"
    "log"
    "net/http"

    "github.com/gorilla/sessions"
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
    "github.com/labstack/echo-contrib/session"
    _ "github.com/go-sql-driver/mysql" // MySQL driver
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
    conf, sessionSecret, err := config.LoadConfig("internal/config/config.json")
    if err != nil {
        log.Fatalf("Failed to load configuration: %v", err)
    }

    // データベース設定をロード
    dbConf, err := config.LoadDBConfig("internal/config/dbconfig.json")
    if err != nil {
        log.Fatalf("Failed to load database configuration: %v", err)
    }

    // データベースに接続
    dbConnStr := config.GetDBConnectionString(dbConf)
    db, err := sql.Open("mysql", dbConnStr)
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }
    defer db.Close()

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
        return handlers.HandleGoogleAuth(c, conf)
    })
    e.GET("/api/auth/google/callback", func(c echo.Context) error {
        return handlers.HandleGoogleCallback(c, conf, store)
    })
    e.GET("/api/dashboard", handlers.DashboardHandler)

    // サーバーを開始
    e.Logger.Fatal(e.Start(":1234"))
}

