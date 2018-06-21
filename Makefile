TARGET := sneetches.zip

.PHONY: build
build: $(TARGET)

$(TARGET): *.css *.html *.js *.json *.png
	@rm -f $@
	zip $@ $^
