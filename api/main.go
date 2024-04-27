package main

import (
	"encoding/json"
	"log"
	"os"

	// パッケージのインポート
	"github.com/fbstocks/api/google_auth"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

type Config struct {
	ClientID      string   `json:"ClientID"`
	ClientSecret  string   `json:"ClientSecret"`
	RedirectURL   string   `json:"RedirectURL"`
	Scopes        []string `json:"Scopes"`
	Endpoint      string   `json:"Endpoint"`
	SessionSecret string   `json:"SessionSecret"`
}

func main() {
	router := gin.Default()

	// Config読み込み
	configData, err := os.ReadFile("config.json")
	if err != nil {
		log.Printf("Failed to read config file: %s", err)
		return
	}
	var conf Config
	if err := json.Unmarshal(configData, &conf); err != nil {
		log.Printf("Failed to unmarshal config: %s", err)
		return
	}

	store := cookie.NewStore([]byte(conf.SessionSecret))
	store.Options(sessions.Options{
		Path:     "/",
		HttpOnly: true, // JavaScriptからのアクセスを禁止
		Secure:   true, // HTTPSのみ
		MaxAge:   3600, // セッションの有効期限を1時間に設定
	})
	router.Use(sessions.Sessions("mysession", store))

	// auth.RegisterAuthRoutes(router)
	google_auth.RegisterAuthRoutes(router) // Google認証のルートを登録

	router.LoadHTMLGlob("/var/www/fbstocks/public/views/*")

	log.Fatal(router.Run(":1234"))
}
