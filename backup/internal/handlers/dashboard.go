package handlers

import (
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo-contrib/session"
    "net/http"
)

// DashboardHandler displays the dashboard page to the logged-in user.
func DashboardHandler(c echo.Context) error {
    sess, err := session.Get("session-name", c)
    if err != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get session")
    }

    username := sess.Values["Username"].(string)
    if username == "" {
        return c.Redirect(http.StatusTemporaryRedirect, "/login")
    }

    return c.Render(http.StatusOK, "dashboard.html", map[string]interface{}{
        "Title": "Dashboard",
        "Username": username,
    })
}
