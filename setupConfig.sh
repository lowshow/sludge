#!/bin/bash

# Prevent running in case of failures
set -euf -o pipefail

USER="$(whoami)"
echo "You are $USER"

CURR_PATH=$(pwd)
echo "Your path $CURR_PATH"

[[ -d config ]] || mkdir config

read -rp "Nginx port >> " PORT
read -rp "Service hostname >> " HOSTNAME
read -rp "Additional hostnames >> " ADDITIONAL_HOSTNAMES
read -rp "Sludge port >> " SLUDGE_PORT
read -rp "Public url >> " PUBLIC_URL
read -rp "Files url >> " FILES_URL
read -rp "Splutter url >> " SPLUTTER_URL

sed -e "s@{{port}}@$PORT@g" \
    -e "s@{{server_name}}@$HOSTNAME $ADDITIONAL_HOSTNAMES@g" \
    -e "s@{{project_path}}@$CURR_PATH@g" \
    -e "s@{{sludge_port}}@$SLUDGE_PORT@g" \
    -e "s@{{home_path}}@$HOME@g" \
    templates/sludge_nginx.conf.template > config/sludge_nginx.conf

sed -e "s@{{user}}@$USER@g" \
    -e "s@{{path}}@$CURR_PATH@g" \
    -e "s@{{files_url}}@$FILES_URL@g" \
    -e "s@{{public_url}}@$PUBLIC_URL@g" \
    -e "s@{{sludge_port}}@$SLUDGE_PORT@g" \
    templates/sludge_server.service.template > config/sludge_server.service

sed -e "s@{{splutter_url}}@$SPLUTTER_URL@g" \
    templates/env.js.template > ui/public/env.js