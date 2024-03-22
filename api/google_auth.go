package main

import (
    "context"
    "encoding/json"
    "github.com/gin-gonic/gin"
    "golang.org/x/oauth2"
    "golang.org/x/oauth2/google"
    "io/ioutil"
    "log"
    "net/http"
)

type Config struct {
    ClientID     string   `json:"ClientID"`
    ClientSecret string   `json:"ClientSecret"`
    RedirectURL  string   `json:"RedirectURL"`
    Scopes       []string `json:"Scopes"`
    Endpoint     string   `json:"Endpoint"`
}

func main() {
    configData, err := ioutil.ReadFile("config.json")
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
    r.GET("/api/auth/google", func(c *gin.Context) { handleGoogleAuth(c, conf) })
    r.GET("/api/auth/google/callback", func(c *gin.Context) { handleGoogleCallback(c, conf) })


    log.Fatal(r.Run(":1234"))
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

    c.Redirect(http.StatusFound, "/dashboard.html")
}
