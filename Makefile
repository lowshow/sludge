PERM0=--allow-env --allow-net --unstable
PERM1=--allow-write="$(HOME)/.sludge" --allow-read="$(HOME)/.sludge"
PERM=$(PERM0) $(PERM1)
ARGS0=--dir="$(HOME)/.sludge" --port="8000" --public="http://0.0.0.0:8000"
ARGS1=--files="http://0.0.0.0:8000/audio/"
ARGS=$(ARGS0) $(ARGS1)

init:
	[[ -d "$(HOME)/.sludge" ]] || mkdir "$(HOME)/.sludge"
	[[ -d typings ]] || mkdir typings
	deno types > typings/deno.d.ts
run:
	deno run $(PERM) src/app.ts $(ARGS)