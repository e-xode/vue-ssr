#!/bin/bash

MONGO_ADMIN_USER=${MONGO_ADMIN_USER:-"admin"}
MONGO_ADMIN_PWD=${MONGO_ADMIN_PWD:-"4dmInP4ssw0rd"}
MONGO_DB=${MONGO_DB:-"admin"}
MONGO_USER=${MONGO_USER:-"restapiuser"}
MONGO_PWD=${MONGO_PWD:-"r3sT4pIp4ssw0rd"}

RET=1
while [[ RET -ne 0 ]]; do
    echo "=> Waiting for confirmation of MongoDB service startup..."
    sleep 5
    mongosh admin --eval "help" >/dev/null 2>&1
    RET=$?
done

mongosh admin --eval "db.createUser({user: '$MONGO_ADMIN_USER', pwd: '$MONGO_ADMIN_PWD', roles:[{role:'root',db:'admin'}]});"

sleep 3

if [ "$MONGO_DB" != "admin" ]; then
    echo "=> Creating a ${MONGO_DB} database user with a password in MongoDB"
    mongosh admin -u $MONGO_ADMIN_USER -p $MONGO_ADMIN_PWD << EOF
use $MONGO_DB
db.createUser({user: '$MONGO_USER', pwd: '$MONGO_PWD', roles:[{role:'dbOwner', db:'$MONGO_DB'}]})
EOF
fi

sleep 3

touch /data/db/.mongodb_password_set
