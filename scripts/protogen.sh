#!/bin/bash

mkdir -p ./pkg/protobuf
mkdir -p ./src/proto

protoc \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --plugin=protoc-gen-js_service=./node_modules/.bin/protoc-gen-js_service \
  --plugin=protoc-gen-go=${GOPATH}/bin/protoc-gen-go \
  --proto_path=../../..:../:. \
  -I${GOPATH}/src \
  -I${GOPATH}/src/github.com/golang/protobuf/proto \
  -I${GOPATH}/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
  --gogofaster_out=Mgoogle/protobuf/any.proto=github.com/gogo/protobuf/types,plugins=grpc:./pkg/protobuf \
  --js_out=import_style=commonjs,binary:./src/proto \
  --js_service_out=./src/proto \
  --ts_out=service=true:./src/proto \
  ../../../github.com/gogo/protobuf/gogoproto/gogo.proto \
  ../../../github.com/c3sr/carml/proto/carml.org/inference/inference.proto \
  ../../../github.com/c3sr/dlframework/dlframework.proto

echo "**/*js" >> ./src/proto/.eslintignore

if [[ "$OSTYPE" == "darwin"* ]]; then
  SED='gsed'
else
  SED="sed"
fi

echo ${SED}

# Insert "/* eslint-disable */"
for f in $(find ./src/proto -name "*.js"); do
  echo $f
  ${SED} -i'' -e '1i /* eslint-disable */' $f
done
for f in $(find ./src/proto -type f); do
  # cat $f | grep "var github\.com"
  ${SED} -i'' -e 's/var github.com/var github_com/g' $f
  # cat $f | grep "var github_com"
done
