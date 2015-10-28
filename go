#!/bin/bash

set -e

function helptext {
    echo "Usage: ./go <command>"
    echo ""
    echo "Available commands are:"
    echo "    build               compile the javascript app"
    echo "    migrate             perform any pending migrations on the fruitybrain database"
    echo "    gateway <tty.file>  run the fruitybrain gateway app at http://localhost:3001"
    echo "    term <tty.file>     run the cli terminal"
    echo "    knex <command>      run the knex cli"
}

function migrateDB(){
  ./node_modules/knex/lib/bin/cli.js migrate:latest
}

function build(){
  npm install 
  node_modules/.bin/webpack
}

function gateway(){
    build
    migrateDB
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
    migrate) migrateDB
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
