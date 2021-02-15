#!/bin/bash

# Script que borra datos innecesarios y crea una copia de la Db que puede ser restaurada.
# Puede ejecutarse periodicamente con herramientas como crontab.

mongo cleanup.js
timestamp=$(date "+%Y.%m.%d-%H.%M.%S")
mkdir "./backups"
mongodump --gzip --archive="./backups/Db-${timestamp}.gz"

# Para restaurar la Db
#mongorestore --gzip --archive="./backups/Db-${timestamp}.gz"