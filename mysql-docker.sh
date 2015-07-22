#! /bin/bash
docker run --name mysql -d -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 mysql
