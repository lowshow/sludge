PERM0=--allow-env --allow-net --unstable
PERM1=--allow-write="$(HOME)/.sludge" --allow-read="$(HOME)/.sludge"
PERM=$(PERM0) $(PERM1)
ARGS0=--dir="$(HOME)/.sludge" --port="$(SLUDGE_PORT)" --public="$(SLUDGE_PUBLIC)"
ARGS1=--files="$(SLUDGE_FILES)"
ARGS=$(ARGS0) $(ARGS1)

init:
	./setupConfig.sh
run:
	ifndef SLUDGE_FILES
	$(error SLUDGE_FILES is not set)
	endif
	ifndef SLUDGE_PUBLIC
	$(error SLUDGE_PUBLIC is not set)
	endif
	ifndef SLUDGE_PORT
	$(error SLUDGE_PORT is not set)
	endif
	$(HOME)/.deno/bin/deno run $(PERM) src/app.ts $(ARGS)