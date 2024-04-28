package main

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type Config struct {
	ClientID     string   `json:"ClientID"`
	ClientSecret string   `json:"ClientSecret"`
	RedirectURL  string   `json:"RedirectURL"`
	Scopes       []string `json:"Scopes"`
	Endpoint     string   `json:"Endpoint"`
}

func main() {

	configData, err := os.ReadFile("config.json")
	if err != nil {
		log.Fatalf("Failed to read config file: %s", err)
	}
	var confData Config
	err = json.Unmarshal(configData, &confData)
	if err != nil {
		log.Fatalf("Failed to unmarshal config: %s", err)
	}

	conf := &oauth2.Config{
		ClientID:     confData.ClientID,
		ClientSecret: confData.ClientSecret,
		RedirectURL:  confData.RedirectURL,
		Scopes:       confData.Scopes,
		Endpoint:     google.Endpoint,
	}

	r := gin.Default()
	// 秘密キーをランダムに生成
	secretKey, err := generateRandomString(32) // 32バイトのランダムな文字列
	if err != nil {
		log.Fatalf("Failed to generate secret key: %v", err)
	}

	store := cookie.NewStore([]byte(secretKey))
	r.Use(sessions.Sessions("mysession", store))
	// テンプレートファイル読み込み
	r.LoadHTMLGlob("/var/www/fbstocks/public/views/*")

	r.GET("/api/auth/google", func(c *gin.Context) { handleGoogleAuth(c, conf) })
	r.GET("/api/auth/google/callback", func(c *gin.Context) { handleGoogleCallback(c, conf) })
	r.GET("/api/dashboard", dashboardHandler)

	log.Fatal(r.Run(":1234"))
}

// generateRandomString は指定された長さのランダムな文字列を生成します。
func generateRandomString(length int) (string, error) {
	b := make([]byte, length)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func handleGoogleAuth(c *gin.Context, conf *oauth2.Config) {
	c.Header("Access-Control-Allow-Origin", "https://fbstocks.pinkgold.space")
	c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	c.Header("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

	authURL := conf.AuthCodeURL("state", oauth2.AccessTypeOffline)
	c.Redirect(http.StatusFound, authURL)
}

func handleGoogleCallback(c *gin.Context, conf *oauth2.Config) {
	c.Header("Access-Control-Allow-Origin", "https://fbstocks.pinkgold.space")
	c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	c.Header("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

	code := c.DefaultQuery("code", "")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing code"})
		return
	}
	token, err := conf.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid code"})
		return
	}
	client := conf.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
		return
	}
	defer resp.Body.Close()
	userInfo := make(map[string]interface{})
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user info"})
		return
	}

	// セッションを取得
	session := sessions.Default(c)

	// ユーザー情報をセッションに保存
	session.Set("username", userInfo["name"].(string))
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
		return
	}
	// ダッシュボードページへのリダイレクト
	c.Redirect(http.StatusFound, "/api/dashboard")

}

func dashboardHandler(c *gin.Context) {
	session := sessions.Default(c)
	userName := session.Get("username")
	if userName == nil {
		// ログインページにリダイレクト
		c.Redirect(http.StatusFound, "/index.html")
		return
	}

	// テンプレートにユーザー名を渡してレンダリング
	c.HTML(http.StatusOK, "dashboard.html", gin.H{"Username": userName})

}
