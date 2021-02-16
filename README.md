El comienzo de algo hermoso.

## Installation

NodeJS
```
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

MongoDB
```
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

Running MongoDB
```
sudo systemctl start mongod
```

Maintenance Tasks
```
# Cleanup and generate a backup on the running mongo instance.
sudo docker-compose exec mongo /mongo/scripts/backup.sh
```

## Credits
Special thanks to Pedro Trujillo for their example on how to build an OAuth2 server using Express and Mongoose

https://github.com/pedroetb/node-oauth2-server-mongo-example
