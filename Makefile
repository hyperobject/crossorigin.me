ESLINT=./node_modules/.bin/eslint
MOCHA=./node_modules/.bin/mocha
NODE=node

test:
		@make lint

lint:
		$(ESLINT) . --ext .js

unit:
		$(MOCHA)

# ---------------------------
#  .PHONY: test lint unit
