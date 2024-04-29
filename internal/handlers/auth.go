package handlers

import (
    "context"
    "encoding/json"
    "net/http"

    "github.com/labstack/echo/v4"
    "golang.org/x/oauth2"
    "github.com/gorilla/sessions"
)

func HandleGoogleAuth(c echo.Context, conf *oauth2.Config) error {
    url := conf.AuthCodeURL("state", oauth2.AccessTypeOffline)
    return c.Redirect(http.StatusTemporaryRedirect, url)
}

func HandleGoogleCallback(c echo.Context, conf *oauth2.Config, store sessions.Store) error {
    code := c.QueryParam("code")
    if code == "" {
        return echo.NewHTTPError(http.StatusBadRequest, "Missing code")
    }
    token, err := conf.Exchange(c.Request().Context(), code)
    if err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, "Invalid code")
    }

    userInfo, err := fetchUserInfo(token)
    if err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch user info")
    }

    session, err := store.Get(c.Request(), "session-name")
    if err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get session")
    }

    if name, ok := userInfo["name"].(string); ok {
        session.Values["Username"] = name
    } else {
        return echo.NewHTTPError(http.StatusInternalServerError, "Failed to obtain user name")
    }

    if err := session.Save(c.Request(), c.Response()); err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, "Failed to save session")
    }

    return c.Redirect(http.StatusTemporaryRedirect, "/api/dashboard")
}

func fetchUserInfo(token *oauth2.Token) (map[string]interface{}, error) {
    client := oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(token))
    response, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
    if err != nil {
        return nil, err
    }
    defer response.Body.Close()

    userInfo := make(map[string]interface{})
    if err := json.NewDecoder(response.Body).Decode(&userInfo); err != nil {
        return nil, err
    }

    return userInfo, nil
}

