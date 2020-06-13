PERM0=--allow-env --allow-net --unstable
PERM1=--allow-write="$(HOME)/.sludge" --allow-read="$(HOME)/.sludge"
PERM=$(PERM0) $(PERM1)
ARGS0=--dir="$(HOME)/.sludge" --port="8000" --public="$(SLUDGE_PUBLIC)"
ARGS1=--files="$(SLUDGE_FILES)"
ARGS=$(ARGS0) $(ARGS1)

init:
	[[ -d "$(HOME)/.sludge" ]] || mkdir "$(HOME)/.sludge"
	[[ -d typings ]] || mkdir typings
	[[ -f typings/deno.d.ts ]] || deno types > typings/deno.d.ts
	git submodule init
	cd external/splutter && npm i
run:
	deno run $(PERM) src/app.ts $(ARGS)