FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY . .
RUN CGO_ENABLED=0 go build -o /server .

FROM alpine:3.23
RUN apk add --no-cache ca-certificates && adduser -D app
COPY --from=build /server /usr/local/bin/server
USER app
EXPOSE 8080
CMD ["server"]
