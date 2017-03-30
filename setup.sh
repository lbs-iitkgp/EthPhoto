#!bin/bash

while getopts s name
do
	case $name in
		s)	sopt=1;;
		*)	echo "`basename ${0}`: usage: [-s]"
			exit 1;;
	esac
done

setup(){
geth --datadir ~/.EthPhoto/ init ./genesis.json
geth --password ~/.EthPhoto/password account new
}

if [[ ! -z $sopt ]]
then
	setup()
fi
 
geth --rpc --datadir ~/.EthPhoto/ --networkid 123 --nodiscover --unlock 0 --password ~/.EthPhoto/password

ipfs daeamon &

node backendTest.js
