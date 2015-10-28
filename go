#!/bin/bash

set -e

function helptext {
    echo "Usage: ./go <command>"
    echo ""
    echo "Available commands are:"
    echo "    build               compile the javascript app"
    echo "    gateway <tty.file>  run the fruitybrain gateway app at http://localhost:3001"
    echo "    term <tty.file>     run the cli terminal"
    echo "    knex <command>      run the knex cli"
}

function build(){
  npm install 
  node_modules/.bin/webpack
}

function gateway(){
    build
	node gateway 3001 "$@"
}

function term(){
	node cli "$@"
}

function knex(){
   node_modules/knex/lib/bin/cli.js "$@"
}

case "$1" in
    build) build
    ;;
    gateway) gateway
    ;;
    term) term
    ;;
    knex) knex
    ;;
    *) helptext
    ;;
esac
