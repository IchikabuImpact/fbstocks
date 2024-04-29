package config

import (
	"encoding/json"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type Config struct {
	ClientID      string   `json:"ClientID"`
	ClientSecret  string   `json:"ClientSecret"`
	RedirectURL   string   `json:"RedirectURL"`
	Scopes        []string `json:"Scopes"`
	SessionSecret string   `json:"SessionSecret"`
}

func LoadConfig(path string) (*oauth2.Config, string, error) {
	file, err := os.ReadFile(path)
	if err != nil {
		return nil, "", err
	}
	var cfg Config
	if err := json.Unmarshal(file, &cfg); err != nil {
		return nil, "", err
	}

	return &oauth2.Config{
		ClientID:     cfg.ClientID,
		ClientSecret: cfg.ClientSecret,
		RedirectURL:  cfg.RedirectURL,
		Scopes:       cfg.Scopes,
		Endpoint:     google.Endpoint,
	}, cfg.SessionSecret, nil
}

