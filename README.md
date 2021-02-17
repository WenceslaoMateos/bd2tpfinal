### Sistema de aprendizaje de MongoDb

Trabajo final de Base de Datos II

## Run

Requires docker and docker-compose.

```
sudo docker-compose up
```

## Backup
```
# Cleanup and generate a backup on the running mongo instance.
sudo docker-compose exec mongo /mongo/scripts/backup.sh
```

## Credits
Special thanks to Pedro Trujillo for their example on how to build an OAuth2 server using Express and Mongoose

https://github.com/pedroetb/node-oauth2-server-mongo-example
