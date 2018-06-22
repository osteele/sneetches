TARGET := sneetches.zip

.PHONY: build
build: $(TARGET)

$(TARGET): *.css *.html *.js *.json images/*.png
	@rm -f $@
	zip $@ $^
