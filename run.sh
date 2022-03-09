#!/bin/bash

SCRIPT_DIR=$(cd $(dirname $0); pwd)
cd $SCRIPT_DIR

#. ~/.zshrc
# anyenv
ENVS="anyenv nodenv"

#for e in `echo $ENVS`; do
#  if type -a $e > /dev/null 2>&1 ; then
#    eval "$($e init - --no-rehash)"
#  fi
#done

export PATH=$HOME/.anyenv/bin:$PATH
eval "$(anyenv init -)"
eval "$(nodenv init -)"

node .
