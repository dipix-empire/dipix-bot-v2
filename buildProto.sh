OUT_DIR="./src/generated/proto"
mkdir -p $OUT_DIR

gen() {
	yarn run grpc_tools_node_protoc \
		--js_out=import_style=commonjs,binary:${OUT_DIR} \
		--grpc_out=grpc_js:${OUT_DIR} \
		--plugin=protoc-gen-grpc=./node_modules/.bin/grpc_tools_node_protoc_plugin \
		-I ./src/proto \
		src/proto/dipix-bot.proto

	yarn run grpc_tools_node_protoc \
		--plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
		--ts_out=grpc_js:${OUT_DIR} \
		-I ./src/proto \
		src/proto/dipix-bot.proto
}

clear() {
	[[ -d $OUT_DIR ]] && rm -r $OUT_DIR || echo "Already cleared."
}

"$@"
