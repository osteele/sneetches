TARGET := dist/sneetches.zip

.PHONY: build publish

publish: build
	@open https://chrome.google.com/webstore/developer/dashboard

build: $(TARGET)

$(TARGET): src/*.css src/*.html src/*.js src/*.json src/images/*.png
	@rm -rf dist
	@mkdir -p dist
	yarn build
	zip $@ $^
