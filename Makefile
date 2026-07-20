.PHONY: dev build test install agents

install:
	cd web && npm install

dev:
	cd web && npm run dev

build:
	cd web && npm run build

test:
	cd web && npm test

# Generate per-vendor agent files (rules, commands, skills) from playbooks/.
# Generated files are gitignored; edit the playbook, not the generated file.
#   make agents                    # all vendors
#   make agents VENDORS=cursor     # a subset (space/comma separated)
agents:
	node scripts/gen-agents.mjs --vendors="$(VENDORS)"
