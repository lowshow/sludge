PERM0=--allow-env --allow-net --unstable
PERM1=--allow-write="$(HOME)/.sludge" --allow-read="$(HOME)/.sludge"
PERM=$(PERM0) $(PERM1)
ARGS0=--dir="$(HOME)/.sludge" --port="$(SLUDGE_PORT)" --public="$(SLUDGE_PUBLIC)"
ARGS1=--files="$(SLUDGE_FILES)"
ARGS=$(ARGS0) $(ARGS1)

init:
	./setupConfig.sh
run:
	test $(SLUDGE_FILES)
	test $(SLUDGE_PUBLIC)
	test $(SLUDGE_PORT)
	$(HOME)/.deno/bin/deno run $(PERM) src/app.ts $(ARGS)