#!/bin/zsh

SCRIPT_DIR=$(cd $(dirname $0); pwd)
cd $SCRIPT_DIR

#. ~/.zshrc
# anyenv
ENVS="anyenv pyenv rbenv nodenv"

for e in `echo $ENVS`; do
  if type -a $e > /dev/null 2>&1 ; then
    eval "$($e init - --no-rehash)"
  fi
done

node weather
