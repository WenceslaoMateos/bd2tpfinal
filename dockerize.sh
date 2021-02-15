#!/bin/bash
sudo docker build -t aprendemongoback - < ./Back/Dockerfile
sudo docker run -d -p 51808:51808 --net=host aprendemongoback

sudo docker build -t aprendemongofront - < ./Front/Dockerfile
sudo docker run -d -p 8080:8080 --net=host aprendemongofront

# docker run --name aprendemongodb -d --net=host mongo:tag

#--mount source=my-vol,target=/usr/local/Back
# Uno para MongoDB
# Uno para Backend
# Uno para Frontend