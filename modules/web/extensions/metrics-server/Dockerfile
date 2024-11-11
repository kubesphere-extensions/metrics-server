FROM nginx:stable-alpine

ARG EXTENSION_NAME=metrics-server

ARG PATH_PREFIX=/usr/share/nginx/html

COPY dist/ ${PATH_PREFIX}/dist/${EXTENSION_NAME}/
COPY v3dist/ ${PATH_PREFIX}/extensions-static/${EXTENSION_NAME}/dist/v3dist/