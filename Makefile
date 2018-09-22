CHROME_TARGET := dist/sneetches-chrome.zip
CHROME_SRC := build/chrome
SOURCE_ZIP := dist/sources.zip

.PHONY: clean build-chrome publish-chrome source-zip

clean:
	rm -rf build dist

publish-chrome: build-chrome
	@open https://chrome.google.com/webstore/developer/dashboard

build-chrome: $(CHROME_TARGET)
source-zip: $(SOURCE_ZIP)

$(CHROME_SRC): $(wildcard src/**/*)
	@rm -rf $@
	@mkdir -p $@
	webpack --mode production --output-path $@
	@# TODO: move the following into the webpack config
	jq 'del(.applications)' < src/manifest.json > $@/manifest.json

$(CHROME_TARGET): $(CHROME_SRC)
	@mkdir -p dist
	(cd build && zip -o ../$@ -r chrome)

$(SOURCE_ZIP): $(shell git ls-files)
	@mkdir -p dist
	zip $@ $^
