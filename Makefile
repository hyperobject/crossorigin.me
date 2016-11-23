ESLINT=./node_modules/.bin/eslint
MOCHA=./node_modules/.bin/mocha
NODE=node

test:
		@make lint
		@make unit

lint:
		$(ESLINT) . --ext .js

unit:
		$(MOCHA) tests/*

# ---------------------------
#  .PHONY: test lint unit
