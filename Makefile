.PHONY: dev build test install

install:
	cd web && npm install

dev:
	cd web && npm run dev

build:
	cd web && npm run build

test:
	cd web && npm test
