#!/bin/bash

# Script que borra datos innecesarios y crea una copia de la Db que puede ser restaurada.
# Puede ejecutarse periodicamente con herramientas como crontab.

mongo -u admin -p 123 /mongo/scripts/cleanup.js
timestamp=$(date "+%Y.%m.%d-%H.%M.%S")
mkdir /mongo/backups
mongodump -u admin -p 123 --gzip --archive="/mongo/backups/Db-${timestamp}.gz"

# Para restaurar la Db
#mongorestore --gzip --archive="/mongo/backups/Db-${timestamp}.gz"