#!/bin/bash

# Prevent running in case of failures
set -euf -o pipefail

[[ -d "$HOME/.sludge" ]] || mkdir "$HOME/.sludge"
[[ -d typings ]] || mkdir typings
[[ -f typings/deno.d.ts ]] || deno types > typings/deno.d.ts

USER="$(whoami)"
echo "You are $USER"

CURR_PATH=$(pwd)
echo "Your path $CURR_PATH"

[[ -d config ]] || mkdir config

CONFIG_PATH="config/template_gen"

if [[ -f "$CONFIG_PATH" ]]; then

    source "$CONFIG_PATH"

fi

PORT=${PORT:-"8000"}
read -rp "Nginx port ($PORT) >> " PORT_INPUT
PORT=${PORT_INPUT:-"$PORT"}

NGINX_HOSTNAME=${NGINX_HOSTNAME:-"127.0.0.1"}
read -rp "Service hostname ($NGINX_HOSTNAME) >> " NGINX_HOSTNAME_INPUT
NGINX_HOSTNAME=${NGINX_HOSTNAME_INPUT:-"$NGINX_HOSTNAME"}

ADDITIONAL_NGINX_HOSTNAMES=${ADDITIONAL_NGINX_HOSTNAMES:-""}
read -rp "Additional hostnames ($ADDITIONAL_NGINX_HOSTNAMES) >> " ADDITIONAL_NGINX_HOSTNAMES_INPUT
ADDITIONAL_NGINX_HOSTNAMES=${ADDITIONAL_NGINX_HOSTNAMES_INPUT:-"$ADDITIONAL_NGINX_HOSTNAMES"}

SLUDGE_PORT=${SLUDGE_PORT:-"8001"}
read -rp "Sludge port ($SLUDGE_PORT) >> " SLUDGE_PORT_INPUT
SLUDGE_PORT=${SLUDGE_PORT_INPUT:-"$SLUDGE_PORT"}

PUBLIC_URL=${PUBLIC_URL:-"http://127.0.0.1:8000/"}
read -rp "Public url ($PUBLIC_URL) >> " PUBLIC_URL_INPUT
PUBLIC_URL=${PUBLIC_URL_INPUT:-"$PUBLIC_URL"}

FILES_URL=${FILES_URL:-"http://127.0.0.1:8000/audio/"}
read -rp "Files url ($FILES_URL) >> " FILES_URL_INPUT
FILES_URL=${FILES_URL_INPUT:-"$FILES_URL"}

SPLUTTER_URL=${SPLUTTER_URL:-"http://127.0.0.1:8002/"}
read -rp "Splutter url ($SPLUTTER_URL) >> " SPLUTTER_URL_INPUT
SPLUTTER_URL=${SPLUTTER_URL_INPUT:-"$SPLUTTER_URL"}

cat << EOF > "$CONFIG_PATH"
PORT="$PORT"
NGINX_HOSTNAME="$NGINX_HOSTNAME"
ADDITIONAL_NGINX_HOSTNAMES="$ADDITIONAL_NGINX_HOSTNAMES"
SLUDGE_PORT="$SLUDGE_PORT"
PUBLIC_URL="$PUBLIC_URL"
FILES_URL="$FILES_URL"
SPLUTTER_URL="$SPLUTTER_URL"
EOF

sed -e "s@{{port}}@$PORT@g" \
    -e "s@{{server_name}}@$NGINX_HOSTNAME $ADDITIONAL_NGINX_HOSTNAMES@g" \
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

ENV=${1:-"prod"}

if [[ "$ENV" == "dev" ]]; then

    if [[ "$OSTYPE" == "linux-gnu"* ]]; then

        if [[ -f "/etc/nginx/sites-enabled/sludge_nginx.conf" ]]; then

            sudo rm "/etc/nginx/sites-enabled/sludge_nginx.conf"

        fi
        
        # Symlink the nginx conf file
        sudo ln -s "$CURR_PATH/config/sludge_nginx.conf" \
            "/etc/nginx/sites-enabled/"

        # Restart nginx to enable conf file
        sudo service nginx restart

    elif [[ "$OSTYPE" == "darwin"* ]]; then

        if [[ -f "/usr/local/etc/nginx/servers/sludge_nginx.conf" ]]; then

            rm "/usr/local/etc/nginx/servers/sludge_nginx.conf"

        fi

        # Symlink the nginx conf file
        ln -s "$CURR_PATH/config/sludge_nginx.conf" \
            "/usr/local/etc/nginx/servers/"

        # Restart nginx to enable conf file
        brew services restart nginx

    else
    
        echo "Unknown OS"
    
    fi

elif [[ "$ENV" == "prod" ]]; then

    if [[ -f "/etc/nginx/sites-enabled/sludge_nginx.conf" ]]; then

        sudo rm "/etc/nginx/sites-enabled/sludge_nginx.conf"

    fi
    
    # Symlink the nginx conf file
    sudo ln -s "$CURR_PATH/config/sludge_nginx.conf" \
        "/etc/nginx/sites-enabled/"

    # Restart nginx to enable conf file
    sudo service nginx restart

    # Create a system entry for the service
    sudo cp "$CURR_PATH/config/sludge_server.service" \
        "/etc/systemd/system/sludge_server.service"

    # Run the service
    sudo systemctl start sludge_server
    
    sudo systemctl enable sludge_server

else
    
    echo "Unknown arg: $ENV"

fi