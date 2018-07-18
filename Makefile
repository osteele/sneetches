TARGET := sneetches.zip

.PHONY: build publish

publish: build
	@open https://chrome.google.com/webstore/developer/dashboard

build: $(TARGET)

$(TARGET): *.css *.html *.js *.json images/*.png
	@rm -f $@
	zip $@ $^
