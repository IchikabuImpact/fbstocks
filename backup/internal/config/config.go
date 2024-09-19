package config

import (
    "encoding/json"
    "fmt"
    "os"

    "golang.org/x/oauth2"
    "golang.org/x/oauth2/google"
    _ "github.com/go-sql-driver/mysql" // MySQL driver
)

type Config struct {
    ClientID      string   `json:"ClientID"`
    ClientSecret  string   `json:"ClientSecret"`
    RedirectURL   string   `json:"RedirectURL"`
    Scopes        []string `json:"Scopes"`
    SessionSecret string   `json:"SessionSecret"`
}

type DBConfig struct {
    DBHost     string `json:"DBHost"`
    DBPort     int    `json:"DBPort"`
    DBUser     string `json:"DBUser"`
    DBPassword string `json:"DBPassword"`
    DBName     string `json:"DBName"`
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

func LoadDBConfig(path string) (*DBConfig, error) {
    file, err := os.ReadFile(path)
    if err != nil {
        return nil, err
    }
    var dbCfg DBConfig
    if err := json.Unmarshal(file, &dbCfg); err != nil {
        return nil, err
    }

    return &dbCfg, nil
}

func GetDBConnectionString(cfg *DBConfig) string {
    return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
        cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)
}

