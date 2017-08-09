package web

import (
	"net/http"

	"github.com/labstack/echo"
	"github.com/rai-project/config"
	"github.com/rai-project/tracer"
	_ "github.com/rai-project/tracer/jaeger"
	tracermiddleware "github.com/rai-project/tracer/middleware"
	_ "github.com/rai-project/tracer/noop"
	_ "github.com/rai-project/tracer/opentracing"
	_ "github.com/rai-project/tracer/zipkin"
)

func apiRoutes(e *echo.Echo) error {
	api := e.Group("/api")

	api.GET("/version", func(c echo.Context) error {
		return c.JSON(http.StatusOK, config.App.Version)
	})
	uploadHandler, err := makeUploadHandler()
	if err != nil {
		return err
	}
	api.Any("/upload/*", uploadHandler)

	dlframeworkHandler, err := getDlframeworkHandler()
	if err != nil {
		return err
	}
	api.Any("/v1/predict*",
		StripPrefix("/api", echo.WrapHandler(dlframeworkHandler)),
		tracermiddleware.FromHTTPRequest(tracer.Std(), "api"),
	)
	api.Any("/*", StripPrefix("/api", echo.WrapHandler(dlframeworkHandler)))

	return nil
}
