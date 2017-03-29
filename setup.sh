#!bin/bash

setup(){
geth --datadir ~/.EthPhoto/ init ./genesis.json
geth --password ~/.EthPhoto/password account new
}

geth --rpc --datadir ~/.EthPhoto/ --networkid 123 --nodiscover --unlock 0 --password ~/.EthPhoto/password

ipfs daeamon &

node backendTest.js
