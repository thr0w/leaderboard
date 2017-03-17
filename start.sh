#!/bin/bash

cd `dirname $0`
root=`pwd`
running=1

trap ctrl_c INT

if [ "$1" == "reset" ]
then
    rm -Rf $root/.meteor/local-cloud
    rm -Rf $root/.meteor/local-lan 
fi 

run_cloud_instance() {
  METEOR_LOCAL_DIR=$root/.meteor/local-cloud h5rep_me=CLOUD h5rep_remote=LAN meteor -p 3100 &
  echo $! > /tmp/h5rep_cloud_instance.pid
}

run_lan_instance() {
  METEOR_LOCAL_DIR=$root/.meteor/local-lan h5rep_me=LAN h5rep_remote=CLOUD meteor -p 3200 &
  echo $! > /tmp/h5rep_lan_instance.pid
}

ctrl_c() {
  echo "** Trapped CTRL-C"
  kill -9 `cat /tmp/h5rep_cloud_instance.pid`
  kill -9 `cat /tmp/h5rep_lan_instance.pid`
  rm /tmp/h5rep_cloud_instance.pid 
  rm /tmp/h5rep_lan_instance.pid
  echo "** finalizado"
}

run_cloud_instance | sed "s/^/[CLOUD] /" &
run_lan_instance | sed "s/^/[LAN] /" &

sleep 5s

while [ -f /tmp/h5rep_cloud_instance.pid -a -f /tmp/h5rep_lan_instance.pid ]
do
  sleep 1
done