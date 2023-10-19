package main

import (
	"context"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"log"
	"net/http"
)

var conf = &oauth2.Config{
	ClientID:     "463184844144-otosbaandgu73bc80s804h1niodus650.apps.googleusercontent.com",
	ClientSecret: "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",
	RedirectURL:  "https://fbstocks.pinkgold.space/callback",
	Scopes:       []string{"https://www.googleapis.com/auth/userinfo.profile"},
	Endpoint:     google.Endpoint,
}

func handleGoogleAuth(w http.ResponseWriter, r *http.Request) {
	authURL := conf.AuthCodeURL("state", oauth2.AccessTypeOffline)
	http.Redirect(w, r, authURL, http.StatusFound)
}

func handleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Missing code.", http.StatusBadRequest)
		return
	}
	token, err := conf.Exchange(context.Background(), code)
	if err != nil {
		http.Error(w, "Invalid code.", http.StatusBadRequest)
		return
	}
	// ここで何らかの成功した処理を行います
	http.Redirect(w, r, "/dashboard.html", http.StatusFound)
}

func main() {
	http.HandleFunc("/auth/google", handleGoogleAuth)
	http.HandleFunc("/callback", handleGoogleCallback)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
