#!/bin/bash

while getopts s name
do
	case $name in
		s)	sopt=1;;
		*)	echo "`basename ${0}`: usage: [-s]"
			exit 1;;
	esac
done

setup(){
address=`geth --datadir ~/.EthPhoto/ --networkid 123 --password ~/.EthPhoto/password account new | cut -d "{" -f2 |cut -d "}" -f1`
sed -i '6s/.*/\t\t\"0x'"${address}"'\":/' ./genesis.json
geth --datadir ~/.EthPhoto/ init ./genesis.json
}

if [[ ! -z $sopt ]]
then
	setup
fi
 
geth --rpc --datadir ~/.EthPhoto/ --networkid 123 --nodiscover --unlock 0 --password ~/.EthPhoto/password --mine &

ipfs daemon &

sleep 5
node gethAPI.js
