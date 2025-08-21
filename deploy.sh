#!/bin/bash

cd "$(dirname "$0")" || exit 1

echo "Diretório atual: $(pwd)"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/dev_robson

git pull --quiet || { echo "Erro ao fazer git pull"; exit 1; }

docker stack rm order_manager_marketplace
docker build -t order_manager_marketplace . || { echo "Erro ao buildar"; exit 1; }
docker stack deploy -c order_manager_marketplace.yaml order_manager_marketplace || { echo "Erro no deploy"; exit 1; }