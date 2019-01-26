#!/bin/bash

if [ ! -z "$NOW_GITHUB_COMMIT_REF" ] && [ "$NOW_GITHUB_COMMIT_REF" != "master" ];
then
  echo 'Deployed as a demo GitHub application. reseting the APP_ID'
  export APP_ID=""
fi

npm run start:bot
