package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// LoadConfig loads the OAuth configuration from a JSON file.
func LoadConfig(filename string) (*oauth2.Config, error) {
	configData, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	var conf Config
	if err := json.Unmarshal(configData, &conf); err != nil {
		return nil, err
	}

	return &oauth2.Config{
		ClientID:     conf.ClientID,
		ClientSecret: conf.ClientSecret,
		RedirectURL:  conf.RedirectURL,
		Scopes:       conf.Scopes,
		Endpoint:     google.Endpoint,
	}, nil
}

// RegisterAuthRoutes configures routes related to authentication.
func RegisterAuthRoutes(router *gin.Engine) {
	oauthConf, err := LoadConfig("config.json")
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	router.GET("/api/auth/google", func(c *gin.Context) { handleGoogleAuth(c, oauthConf) })
	router.GET("/api/auth/google/callback", func(c *gin.Context) { handleGoogleCallback(c, oauthConf) })
}

func handleGoogleAuth(c *gin.Context, conf *oauth2.Config) {
	url := conf.AuthCodeURL("state", oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func handleGoogleCallback(c *gin.Context, conf *oauth2.Config) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Code is missing"})
		return
	}
	token, err := conf.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange token"})
		return
	}
	session := sessions.Default(c)
	session.Set("user-token", token.AccessToken)
	session.Save()
	c.Redirect(http.StatusFound, "/api/dashboard")
}
