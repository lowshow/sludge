init:
	mkdir out
	touch out/list
	mkdir typings
	deno types > typings/deno.d.ts
run:
	deno run --allow-net --allow-write=./out --allow-read=./out src/main.ts